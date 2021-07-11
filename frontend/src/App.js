import {
    Route, Switch,
    BrowserRouter as Router,
    Redirect,
} from "react-router-dom"
import React from "react"
import GameView from "./components/GameView"
import { Themes } from "antworld-shared/src/game/Themes"

function App() {
    let trailScale = 3
    let w = 1620
    let h = (~~(w / 3 / trailScale)) * trailScale
    if (w % trailScale !== 0 || h % trailScale !== 0) {
        throw new Error("Width (" + w + ") and height (" + h + ") must be divisible by " + trailScale)
    }
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
