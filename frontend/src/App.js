import {
    Route, Switch,
    BrowserRouter as Router,
    Redirect,
} from "react-router-dom"
import React from "react"
import GameView from "./components/GameView"
import { Themes } from "antworld-shared/src/game/Themes"

function App() {
    let w = 1300
    let h = ~~(w / 3)
    return <Router>
        <Switch>
            <Route exact path="/">
                <Redirect to={Object.keys(Themes)[0].toLowerCase()} />
            </Route>
            {Object.keys(Themes).map((name) =>
                <Route key={name} exact path={"/" + name.toLowerCase()}>
                    <GameView theme={Themes[name]} width={w} height={h} />
                </Route >
            )}
        </Switch>
    </Router>
}

export default App
