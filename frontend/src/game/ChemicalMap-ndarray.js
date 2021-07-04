// @ts-nocheck
import { getRGB } from "lib/color"
import ndarray from "ndarray"
import stencilOp from "vendors/cave-automata-2d/ndarray-stencil"
import { GameObject } from "./Random"

export default class ChemicalMap extends GameObject {
    constructor({ world, name, width, height, color, evaporate }) {
        super(world)
        this.name = name
        this.width = width
        this.height = height
        this.rawMap = ndarray(new Float32Array(width * height), [width, height])
        this.min = 0
        this.evaporate = evaporate
        this.max = 1e-9
        this.evaporate = evaporate
        this.seed = 1337 ^ 0xDEADBEEF

        this.color = getRGB(color)
        this.color[3] = 0

        // Store [R, G, B, 0, R, G, B, 0, ...]
        this.placeholder = new Uint8ClampedArray(4 * width * height)
        for (let i = 0; i < this.placeholder.length; i += 4) {
            this.placeholder.set(this.color, i)
        }
    }

    gameLoop() {
        // console.log("this.rawMap", this.rawMap)
        let map = this.rawMap
        let width = this.width
        let height = this.height

        // the chemical diffuses and evaporate
        let { result, min, max } = diffuseNdArray(map, this.world.wall, width, height, this.evaporate)

        this.rawMap = result
        this.min = (this.min * 0.9 + min * 0.1)
        this.max = (this.max * 0.9 + max * 0.1)
    }

    render(ctx) {
        let data = this.rawMap

        let bitmap = ctx.bitmap
        bitmap.set(this.placeholder)

        let pos = 0
        //      Math.floor(((data[i]-min)/(max-min))^evaPow * 255) > 0
        // <=>  ((data[i]-min)/(max-min))^evaPow * 255 >= 1
        // <=>  ((data[i]-min)/(max-min))^evaPow >= 1/255
        // <=>  (data[i]-min)/(max-min) >= Math.pow(1/255, 1/evaPow)
        // <=>  (data[i]-min) >= Math.pow(1/255, 1/evaPow) * (max-min)
        // <=>  data[i] >= Math.pow(1/255, 1/evaPow) * (max-min) + min
        let evaPow = 0.2 / this.evaporate
        let valZeroThreshold = Math.pow(2 / 255, 1 / evaPow) * (this.max - this.min) + this.min
        let minMaxDiff = (this.max - this.min)
        for (let j = 0; j < data.shape[1]; j++) {
            for (let i = 0; i < data.shape[0]; i++) {
                let dataValue = data.get(i, j)
                if (dataValue >= valZeroThreshold) {
                    let val = (dataValue - this.min) / minMaxDiff
                    val = Math.exp(Math.log(val) * evaPow) // a^b = e^(log(a)*b)
                    val = ~~(val * 200) // quicker Math.floor
                    bitmap[pos + 3] = val
                }
                pos += 4
            }
        }
    }

    put(x, y, value) {
        let idx = this.rawMap.index(~~x, ~~y)
        this.rawMap.data[idx] = Math.max(0, Math.min(255, this.rawMap.data[idx] + value))
    }

    putIdx(idx, value) {
        let x = idx % this.width
        let y = Math.floor(idx / this.width)
        this.put(x, y, value)
    }

    clean(x, y, coeff = 0.99) {
        let idx = this.rawMap.index(~~x, ~~y)
        this.rawMap.data[idx] *= coeff
    }

    sum(xc, yc, sz) {
        xc = Math.floor(xc)
        yc = Math.floor(yc)
        let res = 0
        for (let i = xc - sz + 1; i < xc + sz; i++) {
            if (i < 0 || i >= this.width) continue
            for (let j = yc - sz + 1; j < yc + sz; j++) {
                if (j < 0 || j >= this.height) continue
                res += this.rawMap.get(i, j)
            }
        }
        return res
    }
}

// ----------------------------------------------------------------

let sharedWidth
let sharedHeight
let sharedScalar
console.log(sharedWidth, sharedHeight, sharedScalar)

const neighbors = [[-1, 0], [0, -1], [0, 1], [1, 0], [0, 0]]
// const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1], [0, 0]]

const conv3x3_stencil = stencilOp(neighbors, function (p1, p2, p3, p4, p5, pos) {
    return (pos[0] <= 0 || pos[0] >= sharedWidth - 1 || pos[1] <= 0 || pos[1] > sharedHeight - 1)
        ? 0 : (p1 + p2 + p3 + p4 + p5) * sharedScalar
}, { useIndex: true })

// perform 2x2 convolution, with [i,j] at a random corner of the 2x2 filter.
export function diffuseNdArray(arr, wall, width, height, evaporate) {
    let result = ndarray(new Float32Array(width * height), [width, height])
    let scalar = evaporate / neighbors.length

    // Updates the shared variables that are available
    // on the module-level scope. This is a synchronous
    // operation, so it's totally safe (though not
    // necessarily pretty) provided these values are
    // updated before any iteration.
    sharedWidth = width
    sharedHeight = height
    sharedScalar = scalar

    conv3x3_stencil(result, arr)

    let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY
    for (let i = 0; i < result.data.length; i++) {
        if (wall.map.data[i]) {
            result.data[i] = 0
        }
        min = Math.min(min, result.data[i])
        max = Math.max(max, result.data[i])
    }

    return { result, min, max }
}
