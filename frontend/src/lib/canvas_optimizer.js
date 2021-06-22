export function makeBitmap(ctx) {
    ctx.bitmap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data
}

export function commitBitmap(ctx) {
    ctx.putImageData(new ImageData(ctx.bitmap, ctx.canvas.width, ctx.canvas.height), 0, 0)
    delete ctx.bitmap
}

export function directPixelManipulation(ctx, fn) {
    makeBitmap(ctx)
    fn(ctx)
    commitBitmap(ctx)
}

export function inject(ctx, fn) {
    commitBitmap(ctx)
    fn(ctx)
    makeBitmap(ctx)
}