import cwise from "cwise"
import ndarray from "ndarray"

// perform 2x2 convolution, with [i,j] at a random corner of the 2x2 filter.
export function diffuse(arr, wall, width, height, evaporate, seed) {
    let filterSize = 2 * 2

    let min = 9999, max = -9999
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
    return { result, min, max }
}

const neighbors = []
for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
        if (!(i === 0 && j === 0))
            neighbors.push({ offset: [i, j], array: 1 })

const conv3x3 = cwise({
    args: ["array", "array", "array", "scalar", ...neighbors],
    body: function (a, wall, center, scalar, p0, p1, p2, p3, p4, p5, p6, p7) {
        a = wall ? 0 : (center + p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7) * scalar
    }
})
console.log(conv3x3)

// perform 2x2 convolution, with [i,j] at a random corner of the 2x2 filter.
export function diffuse1(arr, wall, width, height, evaporate) {
    let result = ndarray(new Float32Array(arr.length), [width, height])
    let min = 9999, max = -9999
    let x = -1
    let y = 0
    let k = evaporate / 3
    let sum = 0
    for (let i = 0; i < arr.length; i++) {
        // optimize
        x++
        if (x === 0) {
            sum = arr[i] + arr[i + 1]
        } else if (x === width) {
            x = 0
            y++
            sum = arr[i] + arr[i + 1]
        } else if (x != width - 1) {
            sum += arr[i + 1]
        }

        if (!wall.allowPoint({ x, y })) {
            result[i] = 0
            continue
        }

        // // fast random
        // seed = (seed + 0xabcdef01 ^ seed >> 6)
        // let offsetX = seed & 1
        // let offsetY = (seed >> 1) & 1

        // let total = 0
        // let zl = Math.max(x + offsetX - 1, 0), zh = Math.min(x + offsetX + 1, width)
        // let tl = Math.max(y + offsetY - 1, 0), th = Math.min(y + offsetY + 1, height)
        // for (let z = zl; z < zh; z++) {
        //     for (let t = tl; t < th; t++) {
        //         total += arr[z + t * width]
        //     }
        // }
        // result[i] = Math.max(0, total / filterSize * evaporate)
        result[i] = Math.max(sum * k, 0)

        if (result[i] < min) min = result[i]
        if (result[i] > max) max = result[i]
    }
    return { result, min, max }
}