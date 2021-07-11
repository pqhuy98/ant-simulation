// @ts-nocheck
const { getRGB } = require("../../lib/color")
const ChemicalMapBase = require("./ChemicalMap_base")

class ChemicalMap2x2 extends ChemicalMapBase {
    constructor(...args) {
        super(...args)
        this.seed = 1337 ^ 0xDEADBEEF
    }

    diffuse(arr, wall, width, height, evaporate) {
        let seed = this.seed
        let filterSize = 2 * 2

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

            if (!wall.allowPoint({ x: x * this.scale, y: y * this.scale }) ||
                !wall.allowPoint({ x: x * this.scale + this.scale, y: y * this.scale + this.scale })) {
                result[i] = 0
                continue
            }

            // fast random
            seed = (seed + 0xabcdef01 ^ seed >> 6)
            let offsetX = seed & 1
            let offsetY = (seed >> 1) & 1

            let total = 0
            let zl = Math.max(x + offsetX - 1, 0), zh = Math.min(x + offsetX + 1, width)
            let tl = Math.max(y + offsetY - 1, 0), th = Math.min(y + offsetY + 1, height)
            for (let z = zl; z < zh; z++) {
                for (let t = tl; t < th; t++) {
                    total += arr[z + t * width]
                }
            }
            result[i] = Math.max(0, total / filterSize * evaporate)

            if (result[i] < min) min = result[i]
            if (result[i] > max) max = result[i]
        }
        this.seed = seed
        return { result, min, max, seed }
    }
}

module.exports = ChemicalMap2x2