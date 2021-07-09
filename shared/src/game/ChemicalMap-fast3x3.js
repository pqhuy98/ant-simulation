// @ts-nocheck
const { getRGB } = require("../lib/color")
const { GameObject } = require("./GameObject")

class ChemicalMap3x3 extends GameObject {
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
        let { result, min, max } = diffuse3x3(map, this.world.wall, width, height, this.evaporate, this.seed)

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
        let evaPow = 0.5 / this.evaporate
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
}

// ----------------------------------------------------------------

// perform 2x2 convolution, with [i,j] at a random corner of the 2x2 filter.
function diffuse3x3(arr, wall, width, height, evaporate) {
    let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY
    let result = new Float32Array(arr.length)

    let x = -1
    let y = 0
    for (let i = 0; i < arr.length; i++) {
        // optimize
        x++
        if (x == width) {
            x = 0
            y++
        }
        if (!wall.allowPoint({ x, y })) {
            result[i] = 0
        } else if (x === 0) {
            result[i] = (arr[i] + arr[i + 1]) / 2 * evaporate
        } else if (x === width - 1) {
            result[i] = (arr[i - 1] + arr[i]) / 2 * evaporate
        } else {
            result[i] = (arr[i - 1] + arr[i] + arr[i + 1]) / 3 * evaporate
        }
    }

    x = -1
    y = 0
    for (let i = 0; i < result.length; i++) {
        // optimize
        x++
        if (x == width) {
            x = 0
            y++
        }

        if (wall.allowPoint({ x, y })) {
            if (y === 0) {
                result[i] = (result[i] + result[i + width]) / 2
            } else if (y === height - 1) {
                result[i] = (result[i - width] + result[i]) / 2
            } else {
                result[i] = (result[i - width] + result[i] + result[i + width]) / 3
            }
            if (result[i] < min) min = result[i]
            if (result[i] > max) max = result[i]
        } else {
            result[i] = 0
        }
    }

    return { result, min, max }
}

module.exports = ChemicalMap3x3