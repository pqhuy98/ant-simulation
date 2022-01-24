/* eslint-disable no-undef */
import {
    Route, Switch,
    BrowserRouter as Router,
    Redirect,
} from "react-router-dom"
import React, { useEffect } from "react"
import GameView from "./components/GameView"
import { Themes } from "antworld-shared/src/game/Themes"
import { useGlobalFunction } from "lib/custom_react_hooks"

function App() {
    const trailScale = 2
    const pixelCount = 1000 * 600
    const whRatio = window.innerWidth / (window.innerHeight - 44)
    let w = Math.round(Math.sqrt(pixelCount * whRatio))
    let h = Math.round(w / whRatio)
    w -= w % trailScale
    h -= h % trailScale

    useEffect(async () => {
        const go = new Go()
        let { instance } = await WebAssembly.instantiateStreaming(
            fetch("wasm/main.wasm", { cache: "no-cache" }),
            go.importObject
        )
        await go.run(instance)
    }, [])
    const sum = useGlobalFunction("sum")
    console.log(sum && sum([new Uint8Array([1, 2, 3]), new Uint8Array([1, 10, 100])]))

    return <Router>
        <Switch>
            <Route exact path="/">
                <Redirect to={Object.keys(Themes)[0].toLowerCase()} />
            </Route>
            {Object.keys(Themes).map((name) =>
                <Route key={name} exact path={"/" + name.toLowerCase()}>
                    <GameView theme={Themes[name]} width={w} height={h} trailScale={trailScale} />
                </Route >
            )}
        </Switch>
    </Router>
}

export default App
