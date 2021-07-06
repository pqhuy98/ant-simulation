import World from "antworld-shared/src/game/World"
import { Random } from "antworld-shared/src/game/Random"
import { encapsulate } from "antworld-shared/src/game/GameObject/serializer"
import { Themes } from "../../../shared/src/game/Themes"
import { exposeWorker } from "react-hooks-worker"

const world = new World({
    width: 1110,
    height: 370,
    specs: {
        ...Themes.Lava,
        // ...DevelopmentThemes.Tiny,
        antSpeedMin: 1,
        antSpeedMax: 2,
    },
    rng: new Random(3, 0, 1),
    postProcessFn: null
})

function getState() {
    for (let i = 0; i < 3; i++) {
        world.gameLoop({ profiler: null })
    }
    return encapsulate(world)
}

exposeWorker(getState)