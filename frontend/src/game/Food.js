import { t } from "config/Themes"
import { randomInt } from "lib/basic_math"
import { getRGB } from "lib/color"

export default class Food {
    constructor({ width, height, foodClusters }) {
        this.width = width
        this.height = height
        this.rawMap = new Uint8ClampedArray(width * height)
        for (let i = 0; i < foodClusters; i++) {
            this.put(
                Math.random() * width,
                Math.random() * height,
                randomInt(...t().foodSize)
            )
        }
    }

    put(x, y, sz, min = t().foodCapacity[0], max = t().foodCapacity[1]) {
        x = Math.floor(x)
        y = Math.floor(y)
        for (let i = x; i < x + sz; i++) {
            for (let j = y; j < y + sz; j++) {
                if (i < 0 || i >= this.width) continue
                if (j < 0 || j >= this.height) continue
                this.rawMap[i + j * this.width] = Math.floor(Math.random() * (max - min) + min)
            }
        }
    }

    take(x, y, amount = 1) {
        x = Math.floor(x)
        y = Math.floor(y)
        this.rawMap[x + y * this.width] -= amount
    }



    has(x, y, sz) {
        x = Math.floor(x)
        y = Math.floor(y)
        for (let i = x - sz + 1; i < x + sz; i++) {
            for (let j = y - sz + 1; j < y + sz; j++) {
                if (i < 0 || i >= this.width) continue
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
        let data = this.rawMap
        let color = getRGB(t().foodColor)

        let bitmap = ctx.bitmap
        let offset = 0
        for (let i = 0; i < data.length; i++) {
            if (data[i] > 0) {
                bitmap.set(color, offset)
            }
            offset += 4
        }
    }
}