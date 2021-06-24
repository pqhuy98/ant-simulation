import {
    Route, Switch,
    BrowserRouter as Router,
} from "react-router-dom"
import React from "react"
import GameView from "./components/GameView"
import { Random, Themes } from "config/Themes"

function App() {
    let w = 850, h = 530
    return <Router>
        <Switch>
            <Route exact path="/">
                <GameView theme={Random()} width={w} height={h} />
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
