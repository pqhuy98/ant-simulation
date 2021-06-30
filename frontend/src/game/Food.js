import { t } from "config/Themes"
import { circle, randomInt, square } from "lib/basic_math"
import { getRGB } from "lib/color"

export const SHAPE_RANDOM = 0
export const SHAPE_SQUARE = 1
export const SHAPE_CIRCLE = 2
export const Shapes = [SHAPE_SQUARE, SHAPE_CIRCLE]

export function randomShape() {
    return Shapes[randomInt(0, Shapes.length)]
}

export default class Food {
    constructor({ width, height, foodClusters, world, shape }) {
        this.width = width
        this.height = height
        this.world = world
        this.rawMap = new Uint8ClampedArray(width * height)
        this.putBuffer = {}
        this.takeBuffer = {}
        for (let i = 0; i < foodClusters; i++) {
            this.put(
                Math.random() * width,
                Math.random() * height,
                randomInt(...t().foodSize),
                shape,
            )
        }
    }

    gameLoop() {
        for (let i = 0; i < this.rawMap.length; i++) {
            if (this.rawMap[i] > 0) {
                this.world.foodTrail.putIdx(i, 1)
            }
        }
    }

    put(x, y, sz, shape, min = t().foodCapacity[0], max = t().foodCapacity[1]) {
        if (!shape) shape = randomShape()
        x = Math.floor(x)
        y = Math.floor(y)
        sz = Math.floor(sz)
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
            let newAmount = Math.floor(Math.random() * (max - min) + min)
            this.rawMap[i + j * this.width] = newAmount
            this.world.unpickedFood += newAmount - oldAmount

            this.putBuffer[i + j * this.width] = true
            this.takeBuffer[i + j * this.width] = false
        })
    }

    take(x, y, amount = 1) {
        x = Math.floor(x)
        y = Math.floor(y)
        this.rawMap[x + y * this.width] -= amount
        this.world.unpickedFood -= amount

        if (this.rawMap[x + y * this.width] <= 0) {
            this.putBuffer[x + y * this.width] = false
            this.takeBuffer[x + y * this.width] = true
        }
    }

    has(x, y, sz) {
        x = Math.floor(x)
        y = Math.floor(y)
        for (let _ = 0; _ < 2; _++) {
            let i = randomInt(x - sz + 1, x + sz)
            let j = randomInt(y - sz + 1, y + sz)
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

    render(ctx) {
        let colorFood = getRGB(t().foodColor)
        let colorEmpty = [0, 0, 0, 0]

        let bitmap = ctx.bitmap
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
        this.putBuffer = {}
        this.takeBuffer = {}
    }
}