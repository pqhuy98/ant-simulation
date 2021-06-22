import { t } from "config/Themes"
import { inject } from "lib/canvas_optimizer"
import { diffuse } from "lib/diffuser"

export default class ChemicalMap {
    constructor({ width, height }) {
        this.width = width
        this.height = height
        this.rawMap = new Float32Array(width * height)
    }

    get(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.rawMap[x + y * this.width]
    }

    put(x, y, value) {
        let idx = Math.floor(x) + Math.floor(y) * this.width
        this.rawMap[idx] = Math.min(100, this.rawMap[idx] + value)
    }

    // eslint-disable-next-line no-unused-vars
    process({ version }) {
        let map = this.rawMap
        let width = this.width
        let height = this.height

        // the chemical diffuses and evaporate
        let { result, min, max } = diffuse(map, width, height, 9.05, 0)

        this.rawMap = result
        this.min = min
        this.max = max
    }

    render(ctx) {
        inject(ctx, (ctx) => {
            let colorZero = t().chemicalColor(0)
            ctx.fillStyle = "rgba(" + colorZero.join(",") + ")"
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        })

        let bitmap = ctx.bitmap
        let data = this.rawMap
        let pos = 0
        for (let i = 0; i < data.length; i++) {
            let val = Math.floor((data[i] - this.min) / this.max * 255)
            if (val > 0) {
                bitmap.set(t().chemicalColor(val), pos)
            }
            pos += 4
        }
    }

    sum(xc, yc, sz) {
        xc = Math.floor(xc)
        yc = Math.floor(yc)
        let res = 0
        for (let i = xc - sz + 1; i < xc + sz; i++) {
            for (let j = yc - sz + 1; j < yc + sz; j++) {
                if (i < 0 || i >= this.width) continue
                if (j < 0 || j >= this.height) continue
                res += this.rawMap[i + j * this.width]
            }
        }
        return res
    }
}