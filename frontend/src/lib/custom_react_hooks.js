// https://github.com/awmleer/use-async-memo/blob/master/src/index.ts
import { useEffect, useState } from "react"

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