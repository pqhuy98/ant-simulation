const World = require("./src/game/World")
const { DevelopmentThemes } = require("./src/game/Themes")
const { Random } = require("./src/game/Random")
const { FpsCalculator } = require("./src/lib/fps")

const world = new World({
    width: 1110,
    height: 370,
    specs: {
        ...DevelopmentThemes.Tiny,
        antSpeedMin: 20,
        antSpeedMax: 40,
    },
    rng: new Random(3, 0, 1)
})

let fps = new FpsCalculator({})
for (let i = 0; i < 1; i++) {
    world.gameLoop({})
    fps.tick()
    console.log(
        "fps:", fps.get(),
        "pickedFood:", world.pickedFood,
        "storedFood:", world.storedFood,
        "unpickedFood:", world.unpickedFood
    )
    console.log(world)
}