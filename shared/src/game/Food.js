const { circle, square } = require("../lib/basic_math")
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
        this.color = color
        for (let i = 0; i < clustersCount; i++) {
            this.put(
                this.r.random() * width,
                this.r.random() * height,
                this.r.randomInt(...this.size),
                shape,
            )
        }
    }

    preGameLoop() {
        this.putBuffer = {}
        this.takeBuffer = {}
    }

    gameLoop() {
        for (let i = 0; i < this.rawMap.length; i++) {
            if (this.rawMap[i] > 0) {
                this.world.foodTrail.putIdx(i, 5)
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
            this.world.unpickedFood += newAmount - oldAmount

            this.putBuffer[i + j * this.width] = true
            this.takeBuffer[i + j * this.width] = false
        })
    }

    take(x, y, amount = 1) {
        x = ~~(x)
        y = ~~(y)
        this.rawMap[x + y * this.width] -= amount
        this.world.unpickedFood -= amount

        if (this.rawMap[x + y * this.width] <= 0) {
            this.putBuffer[x + y * this.width] = false
            this.takeBuffer[x + y * this.width] = true
        }
    }

    has(x, y, sz) {
        x = ~~(x)
        y = ~~(y)
        for (let _ = 0; _ < 2; _++) {
            let i = this.r.randomInt(x - sz + 1, x + sz)
            let j = this.r.randomInt(y - sz + 1, y + sz)
            if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
                continue
            }
            let idx = i + j * this.width
            if (this.rawMap[idx] > 0) {
                return [i, j]
            }
        }
        for (let i = x - sz + 1; i < x + sz; i++) {
            if (i < 0 || i >= this.width) continue
            for (let j = y - sz + 1; j < y + sz; j++) {
                if (j < 0 || j >= this.height) continue
                let idx = i + j * this.width
                if (this.rawMap[idx] > 0) {
                    return [i, j]
                }
            }
        }
        return null
    }

    hasAtIdx(idx) {
        return this.rawMap[idx] > 0
    }

    render(ctx) {
        let colorFood = getRGB(this.color)
        let colorEmpty = [0, 0, 0, 0]

        let bitmap = ctx.bitmap
        if (ctx.worldVersion + 1 === this.world.version) {
            // only update 
            for (const pos in this.putBuffer) {
                if (this.putBuffer[pos]) {
                    bitmap.set(colorFood, parseInt(pos) * 4)
                }
            }
            for (const pos in this.takeBuffer) {
                if (this.takeBuffer[pos]) {
                    bitmap.set(colorEmpty, parseInt(pos) * 4)
                }
            }
        } else if (ctx.worldVersion === this.world.version) {
            // canvas is already up-to-date, do not render
        }
        else { // canvas is too out-of-date
            for (let i = 0; i < this.rawMap.length; i++) {
                if (this.rawMap[i] > 0) {
                    bitmap.set(colorFood, i * 4)
                } else {
                    bitmap.set(colorEmpty, i * 4)
                }
            }
        }
        ctx.worldVersion = this.world.version
    }

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