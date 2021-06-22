export function diffuse(arr, width, height, denominator = 9, evaporate = 0) {
    let min = 9999, max = -9999
    evaporate *= 9
    let result = new Float32Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
        let x = i % width
        let y = Math.floor(i / width)
        let total = evaporate
        let zl = Math.max(x - 1, 0), zh = Math.min(x + 2, width)
        let tl = Math.max(y - 1, 0), th = Math.min(y + 2, height)
        for (let z = zl; z < zh; z++) {
            for (let t = tl; t < th; t++) {
                total += arr[z + t * width]
            }
        }
        result[i] = Math.max(0, total / denominator)
        if (result[i] < min) min = result[i]
        if (result[i] > max) max = result[i]
    }
    return { result, min, max }
}