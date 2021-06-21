import { t } from "config/Themes"

export default class Food {
    constructor({ width, height }) {
        this.width = width
        this.height = height
        this.rawMap = new Uint8ClampedArray(width * height)
    }

    put(x, y, sz, min = t().foodCapacity[0], max = t().foodCapacity[1]) {
        x = Math.floor(x)
        y = Math.floor(y)
        for (let i = x; i < x + sz; i++) {
            for (let j = y; j < y + sz; j++) {
                let idx = i + j * this.width
                if (idx < 0 || idx >= this.rawMap.length) {
                    continue
                }
                this.rawMap[idx] = Math.floor(Math.random() * (max - min) + min)
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
                if (idx < 0 || idx >= this.rawMap.length) {
                    continue
                }
                if (this.rawMap[idx] > 0) {
                    return [i, j]
                }
            }
        }
        return null
    }

    render(ctx) {
        let data = this.rawMap
        ctx.fillStyle = t().foodColor
        for (let i = 0; i < data.length; i++) {
            if (data[i] > 0) {
                let x = i % this.width
                let y = Math.floor(i / this.width)
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}