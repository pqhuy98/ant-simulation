export function makeBitmap(ctx, reset = false, persistent = false) {
    if (persistent && ctx.bitmap) return
    if (!reset) {
        ctx.bitmap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data
    } else {
        ctx.bitmap = new Uint8ClampedArray(4 * ctx.canvas.width * ctx.canvas.height)
    }
    ctx.bitmap.addPixelLayer = (color, pos) => {
        let alpha = color[3]
        let oneMinusAlpha = 255 - color[3]
        ctx.bitmap[pos] = (color[0] * alpha + ctx.bitmap[pos] * oneMinusAlpha) / 256
        ctx.bitmap[pos + 1] = (color[1] * alpha + ctx.bitmap[pos + 1] * oneMinusAlpha) / 256
        ctx.bitmap[pos + 2] = (color[2] * alpha + ctx.bitmap[pos + 2] * oneMinusAlpha) / 256
        ctx.bitmap[pos + 3] = 255
    }
}

export function commitBitmap(ctx) {
    // console.log(ctx.bitmap)
    ctx.putImageData(new ImageData(ctx.bitmap, ctx.canvas.width, ctx.canvas.height), 0, 0)
    // delete ctx.bitmap
}

export function directPixelManipulation(ctx, fn, reset = false, persistent = false) {
    makeBitmap(ctx, reset, persistent)
    fn(ctx)
    commitBitmap(ctx)
}

export function inject(ctx, fn) {
    commitBitmap(ctx)
    fn(ctx)
    makeBitmap(ctx)
}