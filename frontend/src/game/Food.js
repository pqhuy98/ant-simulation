import { t } from "config/Themes"
import { randomInt } from "lib/basic_math"
import { getRGB } from "lib/color"

export default class Food {
    constructor({ width, height, foodClusters, world }) {
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
                randomInt(...t().foodSize)
            )
        }
    }

    gameLoop() {

    }

    put(x, y, sz, min = t().foodCapacity[0], max = t().foodCapacity[1]) {
        x = Math.floor(x)
        y = Math.floor(y)
        sz = Math.floor(sz)
        for (let i = x; i < x + sz; i++) {
            if (i < 0 || i >= this.width) continue
            for (let j = y; j < y + sz; j++) {
                if (j < 0 || j >= this.height) continue
                let oldAmount = this.rawMap[i + j * this.width]
                let newAmount = Math.floor(Math.random() * (max - min) + min)
                this.rawMap[i + j * this.width] = newAmount
                this.world.unpickedFood += newAmount - oldAmount

                this.putBuffer[i + j * this.width] = true
                this.takeBuffer[i + j * this.width] = false
            }
        }
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