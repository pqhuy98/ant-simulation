// Solution for WebWorker on Create-React-App: https://github.com/facebook/create-react-app/issues/3660#issuecomment-603922095
import World from "antworld-shared/src/game/World"
import { freshRNG } from "antworld-shared/src/game/Random"
import { encapsulate } from "antworld-shared/src/game/GameObject/serializer"
import * as Comlink from "comlink"
import { Profiler } from "antworld-shared/src/lib/performance"
// import { GameObject } from "antworld-shared/src/game/GameObject"

const scale = 3
class GameWorker {
    constructor({ theme, width, height, trailScale }) {
        this.world = new World({
            width, height, trailScale,
            specs: {
                ...theme,
                // ...DevelopmentThemes.Tiny,
                antSpeedMin: 20 * scale,
                antSpeedMax: 40 * scale,
                // antCount: 50000,
            },
            rng: freshRNG(),
            postProcessFn: null,
        })
        this.package = {
            data: null,
            transferables: [],
        }
    }

    nextAndGetFullState() {
        this.next()
        return Comlink.transfer(this.package.data, this.package.transferables)
    }

    next() {
        let profiler = new Profiler()
        this.world.gameLoop({ profiler })
        let encap = encapsulate(this.world)
        profiler.tick("encap_time")
        let data = {
            profiler: profiler.values,
            data: encap.data,
        }
        this.package = {
            data,
            transferables: encap.transferables
        }
    }
}

Comlink.expose(GameWorker)