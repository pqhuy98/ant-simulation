export function makeBitmap(ctx) {
    ctx.bitmap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data
    ctx.bitmap.addPixelLayer = (color, pos) => {
        ctx.bitmap.set([
            (color[0] * color[3] + ctx.bitmap[pos] * (255 - color[3])) >> 8,
            (color[1] * color[3] + ctx.bitmap[pos + 1] * (255 - color[3])) >> 8,
            (color[2] * color[3] + ctx.bitmap[pos + 2] * (255 - color[3])) >> 8,
            255,
        ], pos)
    }
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