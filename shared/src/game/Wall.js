const cave = require("../vendors/cave-automata-2d/cave-automata-2d")
const { circle } = require("../lib/basic_math")
const { GameObject } = require("./GameObject")
const ndarray = require("ndarray")

module.exports = class Wall extends GameObject {
    constructor({ world, width, height, scale, flip, border }) {
        super(world)
        this.width = width
        this.height = height
        console.log("cave scale:", scale)
        scale = scale || null
        this.scale = scale
        if (!isNaN(this.scale) && scale !== null) {
            this.map = generate({ width, height, scale, border, rng: this.r })
            if (flip) {
                for (let i = 0; i < this.map.shape[0]; i++)
                    for (let j = 0; j < this.map.shape[1]; j++)
                        this.map.set(i, j, 1 - this.map.get(i, j))
            }
            this.disabled = false
        } else {
            this.map = null // ndarray(new Uint8Array(width * height), [width, height])
            this.disabled = true
        }
        this.rendered = false
    }

    allowPoint({ x, y }) {
        if (this.disabled) return true
        x = ~~(x)
        y = ~~(y)
        return this.map.get(x, y) === 0
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
        if (this.renderIsDisabled()) {
            return
        }
        if (this.disabled) return
        if (this.rendered) return; else this.rendered = true
        let img = new ImageData(this.width, this.height)
        for (let i = 0; i < this.map.shape[0]; i++) {
            for (let j = 0; j < this.map.shape[1]; j++) {
                img.data[(i + j * this.width) * 4 + 3] = this.map.get(i, j) ? 255 : 0
                // img.data[(i + j * this.width) * 4 + 2] = 50
            }
        }
        ctx.putImageData(img, 0, 0)
    }

    renderIsDisabled() { return this.world.disabledRenders.wall }

    gameLoop() {
    }
}


function generate({ width, height, scale, border, rng }) {
    let scaledWidth = ~~(width / scale)
    let scaledHeight = ~~(height / scale)
    // @ts-ignore
    let grid = ndarray(new Uint8Array(scaledWidth * scaledHeight), [scaledWidth, scaledHeight])
    let iterate = cave(grid, {
        density: rng.randomExp(0.4, 0.47),
        threshold: 5,
        hood: 1,
        fill: true,
        border: true,
        rng,
    })
    iterate(5)
    let result = scaleArray(grid, scaledWidth, scaledHeight, width, height)
    smoothen(result, width, height, Math.min(~~(scale), 5), rng)
    for (let d = 0; d <= Math.max(scale, border || 0); d++) {
        for (let i = 0; i < result.shape[0]; i++) {
            result.set(i, d, 1)
            result.set(i, result.shape[1] - 1 - d, 1)
        }
        for (let i = 0; i < result.shape[1]; i++) {
            result.set(d, i, 1)
            result.set(result.shape[0] - 1 - d, i, 1)
        }
    }
    return result
}

function scaleArray(array, oldWidth, oldHeight, newWidth, newHeight) {
    let result = ndarray(new Uint8Array(newWidth * newHeight), [newWidth, newHeight])
    let scaleX = newWidth / oldWidth
    let scaleY = newHeight / oldHeight
    for (var x0 = 0; x0 < oldWidth; x0++) {
        for (var y0 = 0; y0 < oldHeight; y0++) {
            for (var dx = 0; dx < scaleX; dx++) {
                var x1 = ~~(x0 * scaleX + dx)
                if (x1 >= newWidth) break
                for (var dy = 0; dy < scaleY; dy++) {
                    var y1 = ~~(y0 * scaleY + dy)
                    if (y1 >= newHeight) break
                    result.set(x1, y1, array.get(x0, y0))
                }
            }
        }
    }
    return result
}

function smoothen(array, width, height, iteration, rng) {
    while (iteration-- > 0) {
        let lowT = rng.randomInt(1, 6)
        let highT = rng.randomInt(1, 6)
        if (lowT > highT) {
            [lowT, highT] = [highT, lowT]
        }

        let data = new Uint8Array(width * height)
        data.set(array.data, 0)
        let original = ndarray(data, [width, height])
        for (let i = 1; i < width - 1; i++) {
            for (let j = 1; j < height - 1; j++) {
                let sum = 0
                for (let di = -1; di <= 1; di++) {
                    if (i + di < 0 || i + di >= width) continue
                    for (let dj = -1; dj <= 1; dj++) {
                        if (j + dj < 0 || j + dj >= height) continue
                        sum += original.get(i + di, j + dj) ? 1 : 0
                    }
                }
                if (sum >= highT) array.set(i, j, 1) // black
                else if (sum <= lowT) array.set(i, j, 0) // white
            }
        }
    }
}
