// @ts-nocheck
import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { selectTheme, t, Themes } from "../config/Themes"
import World from "../game/World"
import Canvas from "./Canvas"
import { FpsCalculator, FpsDisplay } from "./Fps"

const FPS = 60
const deltaT = 1 / FPS

export default function GameView({ theme, width, height }) {
    const world = useMemo(() => {
        selectTheme(theme)
        return new World({
            width, height,
            antCount: t().antCount,
            colonyCount: t().colonyCount,
            foodClusters: t().foodClusters,
        })
    }, [theme])
    const draw = useMemo(() => (...args) => world?.render(...args), [world])
    const next = useMemo(() => () => world?.gameLoop({ deltaT }), [world])

    const [fps, setFps] = useState(0)
    const fpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setFps(fpsValue)
    }, [world.id]))

    // Resize detection
    return <div style={{
        width: "100%",
        height: "100%",
        paddingTop: "30px"
    }}>
        <ThemeLinks />
        <Link text="github" url="https://github.com/pqhuy98/ant-simulation" />
        <FpsDisplay fpsValue={fps} />
        <br />
        <Canvas
            width={width}
            height={height}
            draw={draw}
            next={next}
            fpsCalculator={fpsCalculator}
        />
    </div >
}
GameView.propTypes = {
    theme: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
}

function ThemeLinks() {
    let links = []
    links.push(<Link key={"/"} text="RANDOM" url="/" />)
    for (const theme in Themes) {
        links.push(<Link key={theme} text={theme} url={theme.toLowerCase()} />)
    }
    return links
}
function Link({ text, url }) {
    let style = {
        color: "white",
        margin: "10px",
    }
    return (
        <a key="link" style={style} href={url}>{text}</a>
    )
}
Link.propTypes = {
    text: PropTypes.string,
    url: PropTypes.string,
}

