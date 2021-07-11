// linear algebra functions
function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y }
}
function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y }
}
function mul(a, k) {
    return { x: a.x * k, y: a.y * k }
}
function zero() {
    return { x: 0, y: 0 }
}
function magnitude(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y)
}
function normalize(a) {
    let angle = Math.atan2(a.y, a.x)
    return { x: Math.cos(angle), y: Math.sin(angle) }
}
function clip(x, l, r) {
    return Math.max(l, Math.min(r, x))
}

// random functions
function randomFloat(l, r) {
    return Math.random() * (r - l) + l
}

function randomInt(l, r) {
    return ~~(randomFloat(l, r))
}

function randomExp(l, r) {
    return Math.exp(randomFloat(Math.log(l), Math.log(r)))
}

function randomColor() {
    var letters = "0123456789ABCDEF"
    var color = "#"
    for (var i = 0; i < 6; i++) {
        color += letters[~~(Math.random() * 16)]
    }
    return color
}

function pickRandom(arr) {
    return arr[randomInt(0, arr.length)]
}

// get all points in a square
function square(x, y, sz, width, height, callback) {
    for (let i = x; i < x + sz; i++) {
        if (i < 0 || i >= width) continue
        for (let j = y; j < y + sz; j++) {
            if (j < 0 || j >= height) continue
            callback(~~i, ~~j)
        }
    }
}

function circle(x, y, sz, width, height, callback) {
    for (let i = x - sz + 1; i < x + sz; i++) {
        if (i < 0 || i >= width) continue
        let yspan = sz * Math.sin(Math.acos((x - i) / sz))
        for (let j = y - yspan + 1; j < y + yspan; j++) {
            if (j < 0 || j >= height) continue
            callback(~~(i), ~~(j))
        }
    }
}


const fullAngle = Math.PI * 2
const sin = {}, cos = {}
const resolution = 1000
for (let i = 0; i < resolution; i++) {
    let deg = i / resolution * Math.PI * 2
    sin[i] = Math.sin(deg)
    cos[i] = Math.cos(deg)
}


function sinApprox(angle) {
    while (angle < 0) angle += fullAngle
    while (angle > fullAngle) angle -= fullAngle
    angle = ~~(angle / fullAngle * resolution)
    return sin[angle]
}

function cosApprox(angle) {
    while (angle < 0) angle += fullAngle
    while (angle > fullAngle) angle -= fullAngle
    angle = ~~(angle / fullAngle * resolution)
    return cos[angle]
}

// Game graphic

function rasterizeOnePixel(bitmap, x, y, colorArr, width) {
    let value = colorArr[3]
    let dx1 = x - (~~x)
    let dy1 = y - (~~y)
    let dx0 = 1 - dx1
    let dy0 = 1 - dy1
    let p00 = dx0 * dy0 * value
    let p01 = dx0 * dy1 * value
    let p10 = dx1 * dy0 * value
    let p11 = dx1 * dy1 * value
    x = ~~x
    y = ~~y
    fillPixel(bitmap, x, y, colorArr, p00, width)
    fillPixel(bitmap, x, y + 1, colorArr, p01, width)
    fillPixel(bitmap, x + 1, y, colorArr, p10, width)
    fillPixel(bitmap, x + 1, y + 1, colorArr, p11, width)
}

function fillPixel(bitmap, x, y, colorArr, value, width) {
    let offset = (x + y * width) * 4
    bitmap[offset] = colorArr[0]
    bitmap[offset + 1] = colorArr[1]
    bitmap[offset + 2] = colorArr[2]
    bitmap[offset + 3] += ~~value
}


module.exports = {
    add, sub, mul, zero, magnitude, normalize, clip, sinApprox, cosApprox,
    randomFloat, randomInt, randomExp, randomColor, pickRandom,
    square, circle, rasterizeOnePixel,
}