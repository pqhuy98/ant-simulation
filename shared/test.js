const World = require("./src/game/World")
const { DevelopmentThemes, Themes } = require("./src/game/Themes")
const { Random } = require("./src/game/Random")
const { FpsCalculator } = require("./src/lib/fps")
const { stringify, parse, revive, encapsulate } = require("./src/game/GameObject/serializer")
const { Timer } = require("./src/lib/performance")
const { compareWorld } = require("./src/test/compare")

const specs = {
    ...Themes.Lava,
    // ...DevelopmentThemes.Tiny,
    antSpeedMin: 1,
    antSpeedMax: 2,
    // antCount: 10,
}

const world = new World({
    width: 1110,
    height: 370,
    specs,
    rng: new Random(3, 0, 1)
})

for (let i = 0; i < 10; i++) {
    world.gameLoop({})
}

let clk = new Timer()
let w1 = world
let encap = encapsulate(w1).data
if (specs.antCount < 15) {
    console.log(JSON.stringify(encap, null, 2))
}
console.log("Encap time:", clk.tick(), "ms")

let w2 = revive(encap)
console.log("Revive time:", clk.tick(), "ms")


if (w2 !== w2.wall.world || !compareWorld(w1, w2)) {
    console.log("w1 and w2 don't match!")
    return -1
}


for (let i = 0; i < 1000; i++) {
    if (!compareWorld(w1, w2)) {
        console.log("step", i)
        break
    }
    w1.gameLoop({})
    w2.gameLoop({})
    if (i % 100 === 0) {
        console.log("iter " + i + ":", "OK")
        // let s1 = stringify(w1)
        // let s2 = stringify(w2)
        // console.log(s1.length / 1000, "KB")
        // console.log(s1)
        // if (s1 === s2) {
        //     console.log("OK")
        // } else {
        //     console.log("state differ!!!")
        //     return -1
        // }
    }
}
