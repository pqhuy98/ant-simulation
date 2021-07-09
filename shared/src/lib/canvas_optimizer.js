function makeBitmap(ctx, reset = false, reuse = false) {
    if (reuse && ctx.bitmap) return // do not reset and reuse bitmap
    if (!reset) {
        ctx.bitmap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data
    } else {
        ctx.bitmap = new Uint8ClampedArray(4 * ctx.canvas.width * ctx.canvas.height)
    }
}

function commitBitmap(ctx) {
    ctx.putImageData(new ImageData(ctx.bitmap, ctx.canvas.width, ctx.canvas.height), 0, 0)
}

function directPixelManipulation(ctx, fn, reset = false, reuse = false) {
    makeBitmap(ctx, reset, reuse)
    fn(ctx)
    commitBitmap(ctx)
}

function inject(ctx, fn) {
    commitBitmap(ctx)
    fn(ctx)
    makeBitmap(ctx)
}

module.exports = {
    makeBitmap,
    commitBitmap,
    directPixelManipulation,
    inject,
}