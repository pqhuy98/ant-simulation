// @ts-nocheck
const { getRGB } = require("../../lib/color")
const { GameObject } = require("../GameObject")

module.exports = class ChemicalMapBase extends GameObject {
    constructor({ world, name, width, height, color, evaporate }) {
        super(world)
        this.name = name
        this.width = width
        this.height = height
        this.rawMap = new Float32Array(width * height)
        this.renderMap = new Uint8ClampedArray(width * height)
        this.min = 0
        this.evaporate = evaporate
        this.max = 1e-9
        this.evaporate = evaporate

        this.color = getRGB(color)
        this.color[3] = 0

        // Store [R, G, B, 0, R, G, B, 0, ...]
        this.placeholder = new Uint8ClampedArray(4 * width * height)
        for (let i = 0; i < this.placeholder.length; i += 4) {
            this.placeholder.set(this.color, i)
        }
    }

    gameLoop({ checkIsCovered }) {
        let map = this.rawMap
        let width = this.width
        let height = this.height

        // the chemical diffuses and evaporate
        let { result, min, max } = this.diffuse(map, this.world.wall, width, height, this.evaporate)

        this.rawMap = result
        this.min = (this.min * 0.9 + min * 0.1)
        this.max = (this.max * 0.9 + max * 0.1)

        // pre-calculate render map
        //      ~~(((data[i]-min)/(max-min))^evaPow * 255) > 0
        // <=>  ((data[i]-min)/(max-min))^evaPow * 255 >= 1
        // <=>  ((data[i]-min)/(max-min))^evaPow >= 1/255
        // <=>  (data[i]-min)/(max-min) >= Math.pow(1/255, 1/evaPow)
        // <=>  (data[i]-min) >= Math.pow(1/255, 1/evaPow) * (max-min)
        // <=>  data[i] >= Math.pow(1/255, 1/evaPow) * (max-min) + min
        let evaPow = 0.3 / this.evaporate
        let valZeroThreshold = Math.pow(2 / 255, 1 / evaPow) * (this.max - this.min) + this.min
        let minMaxDiff = (this.max - this.min)
        let pos = 0
        let data = this.rawMap
        for (let i = 0; i < data.length; i++) {
            // if (checkIsCovered && checkIsCovered(i)) {
            //     this.renderMap[i] = 0
            //     continue
            // }
            if (data[i] >= valZeroThreshold) {
                let val = (data[i] - this.min) / minMaxDiff
                val = Math.exp(Math.log(val) * evaPow) // a^b = e^(log(a)*b)
                val = ~~(val * 200) // quicker ~~
                this.renderMap[i] = val
            } else {
                this.renderMap[i] = 0
            }
        }
    }

    render(ctx, checkIsCovered) {
        let data = this.rawMap

        let bitmap = ctx.bitmap
        bitmap.set(this.placeholder)

        let pos = 0
        for (let i = 0; i < data.length; i++) {
            bitmap[pos + 3] = this.renderMap[i]
            pos += 4
        }
    }

    get(x, y) {
        x = ~~(x)
        y = ~~(y)
        return this.rawMap[x + y * this.width]
    }

    put(x, y, value) {
        let idx = ~~(x) + ~~(y) * this.width
        this.rawMap[idx] = Math.max(0, Math.min(255, this.rawMap[idx] + value))
    }

    putIdx(idx, value) {
        this.rawMap[idx] = Math.max(0, Math.min(255, this.rawMap[idx] + value))
    }

    clean(x, y, coeff = 0.99) {
        let idx = ~~(x) + ~~(y) * this.width
        this.rawMap[idx] *= coeff
    }

    sum(xc, yc, sz) {
        xc = ~~(xc)
        yc = ~~(yc)
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

    diffuse(arr, wall, width, height, evaporate) {
        return { arr, min: 0, max: 1 }
    }
}
