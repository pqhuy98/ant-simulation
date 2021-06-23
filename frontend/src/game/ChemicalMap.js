import { getRGB } from "lib/color"
import { diffuse } from "lib/diffuser"

export default class ChemicalMap {
    constructor({ width, height, color }) {
        this.width = width
        this.height = height
        this.rawMap = new Float32Array(width * height)
        this.color = getRGB(color)
        this.min = 0
        this.max = 0
        this.evaporate = 0.8
    }


    // eslint-disable-next-line no-unused-vars
    process({ version }) {
        let map = this.rawMap
        let width = this.width
        let height = this.height

        // the chemical diffuses and evaporate
        let { result, min, max } = diffuse(map, width, height, this.evaporate)

        this.rawMap = result
        this.min = (this.min * 0.9 + min * 0.1)
        this.max = (this.max * 0.9 + max * 0.1)
    }

    render(ctx) {
        // let color = getRGB(t().chemicalColor)
        let color = [...this.color]
        let bitmap = ctx.bitmap
        let data = this.rawMap
        let pos = 0

        let evaPow = 0.3 / this.evaporate
        //      Math.floor(((data[i]-min)/(max-min))^evaPow * 255) > 0
        // <=>  ((data[i]-min)/(max-min))^evaPow * 255 >= 1
        // <=>  ((data[i]-min)/(max-min))^evaPow >= 1/255
        // <=>  (data[i]-min)/(max-min) >= Math.pow(1/255, 1/evaPow)
        // <=>  (data[i]-min) >= Math.pow(1/255, 1/evaPow) * (max-min)
        // <=>  (data[i]-min) >= Math.pow(1/255, 1/evaPow) * (max-min) + min
        let valZeroThreshold = Math.pow(5 / 255, 1 / evaPow) * (this.max - this.min) + this.min
        for (let i = 0; i < data.length; i++) {
            // // Original code:
            if (data[i] >= valZeroThreshold) {
                let val = (data[i] - this.min) / (this.max - this.min)
                val = Math.pow(val, evaPow)
                val = Math.floor(val * 255)
                color[3] = val
                bitmap.addPixelLayer(color, pos)
            }
            pos += 4
        }
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

    sum(xc, yc, sz) {
        xc = Math.floor(xc)
        yc = Math.floor(yc)
        let res = 0
        for (let i = xc - sz + 1; i < xc + sz; i++) {
            if (i < 0 || i >= this.width) continue
            for (let j = yc - sz + 1; j < yc + sz; j++) {
                if (j < 0 || j >= this.height) continue
                res += this.rawMap[i + j * this.width]
            }
        }
        return res
    }
}