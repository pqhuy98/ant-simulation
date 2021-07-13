// Solution for WebWorker on Create-React-App: https://github.com/facebook/create-react-app/issues/3660#issuecomment-603922095
import World from "antworld-shared/src/game/World"
import { freshRNG } from "antworld-shared/src/game/Random"
import { encapsulate } from "antworld-shared/src/game/GameObject/serializer"
import * as Comlink from "comlink"
import { Profiler } from "antworld-shared/src/lib/performance"
// import { GameObject } from "antworld-shared/src/game/GameObject"

const speedScale = 4
const FPS_LIMIT = 10
var lastT = performance.now()
class GameWorker {
    constructor({ theme, width, height, trailScale }) {
        this.world = new World({
            width, height, trailScale,
            specs: {
                ...theme,
                // ...DevelopmentThemes.Tiny,
                antSpeedMin: 20 * speedScale,
                antSpeedMax: 40 * speedScale,
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

    async nextAndGetFullState() {
        this.next()
        let expectedT = 1000 / FPS_LIMIT
        let remainingT = expectedT - (performance.now() - lastT)
        if (remainingT > 0) {
            await sleep(remainingT)
        }
        lastT = performance.now()
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

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

Comlink.expose(GameWorker)