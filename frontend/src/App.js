import React from "react"
import GameView from "./components/GameView"

function App() {
    return [
        <a
            key="link"
            style={{
                color: "white"
            }}
            href={"https://github.com/pqhuy98/ant-simulation"}
        >
            Github
        </a>,
        <GameView key="game" />
    ]
}

export default App
