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
    let trailScale = 2
    let w = 1200
    let h = (~~(w / 2.6 / trailScale)) * trailScale
    if (w % trailScale !== 0 || h % trailScale !== 0) {
        throw new Error("Width (" + w + ") and height (" + h + ") must be divisible by " + trailScale)
    }
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
