const World = require("./src/game/World")
const { DevelopmentThemes, Themes } = require("./src/game/Themes")
const { Random } = require("./src/game/Random")
const { FpsCalculator } = require("./src/lib/fps")
const { stringify, parse } = require("./src/game/GameObject/serializer")
const { Timer } = require("./src/lib/performance")
const { compareWorld } = require("./src/test/compare")

const world = new World({
    width: 1110,
    height: 370,
    specs: {
        ...Themes.Lava,
        // ...DevelopmentThemes.Tiny,
        antSpeedMin: 1,
        antSpeedMax: 2,
    },
    rng: new Random(3, 0, 1)
})

for (let i = 0; i < 10; i++) {
    world.gameLoop({})
}

let clk = new Timer()
let w1 = world
let w2 = parse(stringify(w1))
console.log("Ser + deser time:", clk.tick(), "ms")

if (w2 !== w2.wall.world || !compareWorld(w1, w2)) {
    console.log("w1 and w2 don't match!")
    return -1
}

let fps = new FpsCalculator({})
for (let i = 0; i < 1000; i++) {
    fps.tick()
    // if (!compareWorld(w1, w2)) {
    //     console.log("step", i)
    //     break
    // }
    w1.gameLoop({})
    w2.gameLoop({})
    if (i % 100 === 0) {
        console.log("iter", i, "- fps", fps.get())
        const fs = require('fs');
        let s1 = stringify(w1)
        let s2 = stringify(w2)

        console.log(s1.length / 1000, "KB")

        if (s1 === s2) {
            console.log("OK")
        } else {
            console.log("state differ!!!")
            return -1
        }
    }
}
