import cave from "../vendors/cave-automata-2d/cave-automata-2d"
import { circle, randomExp, randomInt } from "lib/basic_math"
const ndarray = require("ndarray")

export default class Wall {
    constructor({ width, height, scale, flip, border }) {
        this.width = width
        this.height = height
        console.log(scale)
        this.scale = scale
        if (scale >= 1) {
            this.map = generate({ width, height, scale, border })
            if (flip) {
                for (let i = 3; i < this.map.data.length; i += 4) {
                    this.map.data[i] = 255 - this.map.data[i]
                }
            }
        } else {
            this.disabled = true
        }
    }

    allowPoint({ x, y }) {
        if (this.disabled) return true
        x = Math.floor(x)
        y = Math.floor(y)
        return this.map.data[(x + y * this.width) * 4 + 3] === 0
    }

    allowCircle({ x, y, sz }) {
        if (this.disabled) return true
        let ok = true
        circle(x, y, sz, this.width, this.height, (i, j) => {
            if (!this.allowPoint({ x: i, y: j })) {
                ok = false
            }
        })
        return ok
    }

    render(ctx) {
        if (this.disabled) return true
        ctx.putImageData(this.map, 0, 0)
    }

    gameLoop() {
    }
}


function generate({ width, height, scale, border }) {
    let scaledWidth = Math.floor(width / scale)
    let scaledHeight = Math.floor(height / scale)
    // @ts-ignore
    let grid = ndarray(new Uint8Array(scaledWidth * scaledHeight), [scaledWidth, scaledHeight])
    let iterate = cave(grid, {
        density: randomExp(0.4, 0.47),
        threshold: 5,
        hood: 1,
        fill: true,
        border,
    })
    iterate(5)
    let img = new ImageData(scaledWidth, scaledHeight)
    for (let i = 0; i < scaledWidth * scaledHeight; i++) {
        if (i % scaledWidth === 0 || i % scaledWidth === scaledWidth - 1 ||
            i < scaledWidth || i > scaledWidth * (scaledHeight - 1)
        ) {
            img.data[i * 4 + 3] = 255
        } else {
            img.data[i * 4 + 3] = grid.get(i % scaledWidth, Math.floor(i / scaledWidth)) * 255
        }
    }
    img = scaleImageData(img, width, height, scale)
    for (let i = width * (height - Math.ceil(height % scale)); i < width * height; i++) {
        img.data[i * 4 + 3] = 255
    }
    smoothen(img, width, height, Math.min(Math.floor(scale), 10))
    return img
}

function scaleImageData(imageData, width, height, scale) {
    var scaled = new ImageData(Math.ceil(width), Math.ceil(height))
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ]
            for (var y = 0; y < scale; y++) {
                var destRow = Math.floor(row * scale + y)
                if (destRow >= height) break
                for (var x = 0; x < scale; x++) {
                    var destCol = Math.floor(col * scale + x)
                    if (destCol >= width) break
                    for (var i = 0; i < 4; i++) {
                        scaled.data[(destRow * scaled.width + destCol) * 4 + i] = sourcePixel[i]
                    }
                }
            }
        }
    }
    return scaled
}

function smoothen(image, width, height, iteration) {
    while (iteration-- > 0) {
        let lowT = randomInt(1, 6)
        let highT = randomInt(1, 6)
        if (lowT > highT) {
            [lowT, highT] = [highT, lowT]
        }
        console.log("L-H", lowT, highT)

        let original = new Uint8ClampedArray(image.data.length)
        original.set(image.data, 0)
        for (let i = 1; i < width - 1; i++) {
            for (let j = 1; j < height - 1; j++) {
                let sum = 0
                for (let di = -1; di <= 1; di++) {
                    if (i + di < 0 || i + di >= width) continue
                    for (let dj = -1; dj <= 1; dj++) {
                        if (j + dj < 0 || j + dj >= height) continue
                        sum += original[((i + di) + (j + dj) * width) * 4 + 3] ? 1 : 0
                    }
                }
                // console.log(sum)
                if (sum >= highT) image.data[(i + j * width) * 4 + 3] = 255 // black
                if (sum <= lowT) image.data[(i + j * width) * 4 + 3] = 0 // white
            }
        }
    }
}
console.log(smoothen)
console.log(scaleImageData)