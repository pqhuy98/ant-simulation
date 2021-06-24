var seed = 1337 ^ 0xDEADBEEF

// perform 2x2 convolution, with [i,j] at a random corner of the 2x2 filter.
export function diffuse(arr, width, height, evaporate = 1, skip = 2) {
    let filterSize = 2 * 2

    let min = 9999, max = -9999
    let result = new Float32Array(arr.length)
    let x = -1
    let y = 0 + skip - skip
    for (let i = 0; i < arr.length; i++) {
        // optimize
        x++
        if (x == width) {
            x = 0
            y++
        }

        // fast random
        seed = (seed + 0x12345678 ^ seed >> 2)
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