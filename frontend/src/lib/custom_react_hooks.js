// https://github.com/awmleer/use-async-memo/blob/master/src/index.ts
import { useEffect, useRef, useState } from "react"
import { revive } from "antworld-shared/src/game/GameObject/serializer"
import { Timer } from "antworld-shared/src/lib/performance"

export function useAsyncMemo(factory, deps, initial = undefined) {
    const [val, setVal] = useState(initial)
    useEffect(() => {
        let cancel = false
        const promise = factory()
        console.log(promise)
        if (promise === undefined || promise === null) return
        promise.then((res) => {
            if (!cancel) {
                console.log(res)
                setVal(res)
            }
        })
        return () => {
            cancel = true
        }
    }, deps)
    return val
}

export function useForceUpdate() {
    const setValue = useState(0)[1] // integer state
    // update the state to force render
    return () => setValue(value => {
        if (value < 9999999) return value + 1
        else return value - 1
    })
}


export function useWorldRefFromGameWorker({ gameWorker, postIteration }) {
    const worldRef = useRef(null)
    useEffect(() => {
        let canceled = false
        console.log("useWorldRefFromGameWorker")
        run()
        async function run() {
            while (!canceled && gameWorker) {
                let t = new Timer()
                let res = await gameWorker.nextAndGetFullState()
                let data = res.data
                let profiler = res.profiler

                let tNext = t.tick()

                // console.log(JSON.stringify(data))
                let revived = revive(data)
                revived.receivedTime = performance.now()
                worldRef.current = revived

                let tRevive = t.tick()

                if (typeof postIteration === "function") {
                    postIteration({ profiler, tNext, tRevive })
                }
            }
        }
        return () => {
            canceled = false
        }
    }, [gameWorker])
    return worldRef
}