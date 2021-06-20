export default class ChemicalMap {
    constructor({ width, height }) {
        this.width = width
        this.height = height
        this.rawMap = new Uint8ClampedArray(width * height)
    }

    put(x, y, value) {
        x = Math.floor(x)
        y = Math.floor(y)
        this.rawMap[x + y * this.width] += value * 100
    }

    // eslint-disable-next-line no-unused-vars
    process({ version }) {
        let oldMap = this.rawMap
        let width = this.width
        let height = this.height

        for (let i = 0; i < oldMap.length; i++) {
            oldMap[i] -= 1
        }

        let newMap = new Uint8ClampedArray(oldMap.length)
        let cnt = 9.1
        for (let i = 0; i < oldMap.length; i++) {
            // middle row
            newMap[i] += oldMap[i] / cnt
            if (i % width > 0) newMap[i] += oldMap[i - 1] / cnt
            if (i % width < width - 1) newMap[i] += oldMap[i + 1] / cnt

            // top row
            if (i - 1 - width >= 0) newMap[i] += oldMap[i - 1 - width] / cnt
            if (i - width >= 0) newMap[i] += oldMap[i - width] / cnt
            if (i + 1 - width >= 0) newMap[i] += oldMap[i + 1 - width] / cnt

            // bottom row
            if (i - 1 + width < width * height) newMap[i] += oldMap[i - 1 + width] / cnt
            if (i + width < width * height) newMap[i] += oldMap[i + width] / cnt
            if (i + 1 + width < width * height) newMap[i] += oldMap[i + 1 + width] / cnt
        }

        this.rawMap = newMap
    }

    render(ctx) {
        let data = this.rawMap
        let image = new Uint8ClampedArray(4 * data.length)
        let pos = 0
        for (let i = 0; i < data.length; i++) {
            let val = 255 - data[i]
            image[pos++] = 0
            image[pos++] = 255 - val
            image[pos++] = 255 - val
            image[pos++] = 255
        }
        ctx.putImageData(new ImageData(image, this.width, this.height), 0, 0)
    }

    sum({ xc, yc, sz }) {
        xc = Math.floor(xc)
        yc = Math.floor(yc)
        let res = 1e-6
        for (let i = xc - sz + 1; i < xc + sz; i++) {
            for (let j = yc - sz + 1; j < yc + sz; j++) {
                if (i < 0 || i >= this.width) continue
                if (j < 0 || j >= this.height) continue
                res += this.rawMap[i + j * this.width]
            }
        }
        return res / (sz * 2 - 1) / (sz * 2 - 1)
    }
}