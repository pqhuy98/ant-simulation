// @ts-nocheck
import React, { useEffect, useState } from "react"
import { t } from "../config/Themes"
import World from "../game/World"
import Canvas from "./Canvas"

const FPS = 60
const deltaT = 1 / FPS

export default function GameView() {
    const [world, setWorld] = useState(null)
    let [size] = useState([666, 475])//[window.innerWidth, window.innerHeight])

    useEffect(() => {
        setWorld(new World({
            width: size[0],
            height: size[1],
            antCount: t().antCount,
            colonyCount: t().colonyCount,
            foodClusters: t().foodClusters,
        }))
    }, [setWorld])

    // let wSetSize = world?.setSize || (() => { })
    // let draw = world?.render || (() => { })
    // let next = world?.gameLoop || (() => { })

    // Resize detection

    return <Canvas
        width={size[0]}
        height={size[1]}
        draw={(ctx) => world?.render(ctx)}
        next={() => world?.gameLoop({ deltaT })}
    />
}