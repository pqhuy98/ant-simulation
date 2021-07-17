const { getRGB } = require("../../lib/color")
const ChemicalMapBase = require("./ChemicalMap_base")

module.exports = class ChemicalMap3x3 extends ChemicalMapBase {
    diffuse(arr, wall, width, height, evaporate) {
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

            if (wall.allowPoint({ x: x * this.scale, y: y * this.scale })) {
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
}
