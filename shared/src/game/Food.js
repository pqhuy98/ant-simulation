const { circle, square } = require("../lib/basic_math")
const { directPixelManipulation } = require("../lib/canvas_optimizer")
const { getRGB } = require("../lib/color")
const { GameObject } = require("./GameObject")

const SHAPE_RANDOM = 0
const SHAPE_SQUARE = 1
const SHAPE_CIRCLE = 2
const Shapes = [SHAPE_SQUARE, SHAPE_CIRCLE]

class Food extends GameObject {
    constructor({ world, width, height, clustersCount, size, capacity, color, shape }) {
        super(world)
        this.width = width
        this.height = height
        this.rawMap = new Uint8ClampedArray(width * height)
        this.putBuffer = {}
        this.takeBuffer = {}
        this.clustersCount = clustersCount
        this.size = size
        this.capacity = capacity
        this.color = getRGB(color)
        this.remaining = 0
        for (let i = 0; i < clustersCount; i++) {
            this.put(
                this.r.random() * width,
                this.r.random() * height,
                this.r.randomInt(...this.size),
                shape,
            )
        }

        this.placeholder = null
        this.postConstruct()
    }

    postConstruct() {
        // Store [R, G, B, 0, R, G, B, 0, ...]
        this.placeholder = new Uint8ClampedArray(4 * this.width * this.height)
        for (let i = 0; i < this.placeholder.length; i += 4) {
            this.placeholder[i] = this.color[0]
            this.placeholder[i + 1] = this.color[1]
            this.placeholder[i + 2] = this.color[2]
            this.placeholder[i + 3] = this.color[3]
        }
    }

    serializableKeys() {
        return Object.keys(this).filter(k => k !== "placeholder")
    }

    preGameLoop() {
        this.putBuffer = {}
        this.takeBuffer = {}
    }

    gameLoop() {
        this.remaining = 0
        for (let i = 0; i < this.rawMap.length; i++) {
            if (this.rawMap[i] > 0) {
                this.remaining += this.rawMap[i]
                this.world.foodTrail.putIdx(i, 1.5)
                if ((this.world.version + i) % 300 === 0) {
                    this.rawMap[i]++
                }
            }
        }
    }

    put(x, y, sz, shape, min = this.capacity[0], max = this.capacity[1]) {
        if (!shape) shape = this.randomShape()
        x = ~~(x)
        y = ~~(y)
        sz = ~~(sz)
        let drawer
        if (shape === SHAPE_SQUARE) {
            drawer = square
        } else if (shape === SHAPE_CIRCLE) {
            drawer = circle
        } else {
            return
        }

        drawer(x, y, sz, this.width, this.height, (i, j) => {
            if (!this.world.wall.allowPoint({ x: i, y: j })) return

            let oldAmount = this.rawMap[i + j * this.width]
            let newAmount = ~~(this.r.random() * (max - min) + min)
            this.rawMap[i + j * this.width] = newAmount

            this.putBuffer[i + j * this.width] = true
            this.takeBuffer[i + j * this.width] = false
        })
    }

    take(x, y, amount = 1) {
        x = ~~(x)
        y = ~~(y)
        this.rawMap[x + y * this.width] -= amount

        if (this.rawMap[x + y * this.width] <= 0) {
            this.putBuffer[x + y * this.width] = false
            this.takeBuffer[x + y * this.width] = true
        }
    }

    has(x, y, sz) {
        x = ~~(x)
        y = ~~(y)
        for (let _ = 0; _ < 4; _++) {
            let i = this.r.randomInt(x - sz + 1, x + sz)
            let j = this.r.randomInt(y - sz + 1, y + sz)
            if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
                continue
            }
            let idx = i + j * this.width
            if (this.rawMap[idx] > 0) {
                return { x: i, y: j }
            }
        }
        for (let i = x - sz + 1; i < x + sz; i++) {
            if (i < 0 || i >= this.width) continue
            for (let j = y - sz + 1; j < y + sz; j++) {
                if (j < 0 || j >= this.height) continue
                let idx = i + j * this.width
                if (this.rawMap[idx] > 0) {
                    return { x: i, y: j }
                }
            }
        }
        return null
    }

    hasAtIdx(idx) {
        return this.rawMap[idx] > 0
    }

    render({ profiler, ctx }) {
        if (this.renderIsDisabled()) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            return
        }
        directPixelManipulation(ctx, (ctx) => {
            profiler.tick("render::food_prepare")


            let colorFood = this.color
            let colorEmpty = [0, 0, 0, 0]

            let bitmap = ctx.bitmap
            if (!bitmap.foodPlaceholderSet) {
                bitmap.set(this.placeholder, 0)
                bitmap.foodPlaceholderSet = true
            }

            if (ctx.worldVersion === this.world.version) {
                // canvas is already up-to-date,do not render
            } else {
                // canvas is out-of-date
                let pos = 0
                for (let i = 0; i < this.rawMap.length; i++) {
                    if (this.rawMap[i] > 0) {
                        bitmap[pos + 3] = colorFood[3]
                    } else {
                        bitmap[pos + 3] = colorEmpty[3]
                    }
                    pos += 4
                }
            }
            ctx.worldVersion = this.world.version
            profiler.tick("render::food")
        }, false, true)
        profiler.tick("render::food post")
    }

    renderIsDisabled() { return this.world.disabledRenders.food }

    randomShape() {
        return Shapes[this.r.randomInt(0, Shapes.length)]
    }
}

module.exports = {
    SHAPE_RANDOM,
    SHAPE_SQUARE,
    SHAPE_CIRCLE,
    Shapes,
    Food,
}