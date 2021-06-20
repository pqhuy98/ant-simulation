import React from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from "react-router-dom"
import World from "./components/World"

function Home() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/game">Game</Link>
                </li>
            </ul>
        </nav>
    )
}

function App() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route path="/about">
                        <h1> About </h1>
                    </Route>
                    <Route path="/game">
                        <World />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    )
}

export default App
