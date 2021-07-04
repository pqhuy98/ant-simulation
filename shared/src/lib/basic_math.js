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

// random functions
function randomFloat(l, r) {
    return Math.random() * (r - l) + l
}

function randomInt(l, r) {
    return Math.floor(randomFloat(l, r))
}

function randomExp(l, r) {
    return Math.exp(randomFloat(Math.log(l), Math.log(r)))
}

function randomColor() {
    var letters = "0123456789ABCDEF"
    var color = "#"
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
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
    for (let i = x - sz; i < x + sz; i++) {
        if (i < 0 || i >= width) continue
        let yspan = sz * Math.sin(Math.acos((x - i) / sz))
        for (let j = y - yspan; j < y + yspan; j++) {
            if (j < 0 || j >= height) continue
            callback(Math.floor(i), Math.floor(j))
        }
    }
}

module.exports = {
    add, sub, mul, zero, magnitude, normalize,
    randomFloat, randomInt, randomExp, randomColor, pickRandom,
    square, circle,
}