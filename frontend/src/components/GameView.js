// @ts-nocheck
import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { selectTheme } from "../config/Themes"
import World from "../game/World"
import Canvas from "./Canvas"
import { FpsCalculator, FpsDisplay } from "./Fps"
import { GithubLink, Header, ThemeLinks } from "./Header"
import config from "../config"
import { Random } from "../game/Random"

export default function GameView({ theme, width, height }) {
    const world = useMemo(() => {
        selectTheme(theme)
        return new World({
            width, height,
            specs: {
                ...theme,
                antSpeedMin: config.ANT_SPEED_MIN,
                antSpeedMax: config.ANT_SPEED_MAX,
            },
            rng: Random.buildFreshRNG()//  new Random(1, primes[0], primes[1])
        })
    }, [theme])
    const draw = useMemo(() => (...args) => world?.render(...args), [world])
    const next = useMemo(() => (...args) => world?.gameLoop(...args), [world])

    const [fps, setFps] = useState(0)
    const fpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setFps(fpsValue)
    }, [world.id]))

    // Resize detection
    return <div style={style.container}>
        <Header>
            <ThemeLinks />
            <GithubLink />
            <FpsDisplay fpsValue={fps} />
        </Header>
        <Canvas
            width={width}
            height={height}
            draw={draw}
            next={next}
            fpsCalculator={fpsCalculator}
        />
        <div style={style.infoContainer}>
            <table style={style.table}><tbody>
                <tr>
                    <td style={style.leftCell}>Ant population:</td>
                    <td style={style.rightCell}> {world.ants.length}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Gathered food: </td>
                    <td style={style.rightCell}> {world.storedFood}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Ungathered food:</td>
                    <td style={style.rightCell}> {world.unpickedFood}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Transporting food: </td>
                    <td style={style.rightCell}> {world.pickedFood}</td>
                </tr>
            </tbody></table>
        </div>
    </div >
}
GameView.propTypes = {
    theme: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
}

const style = {
    container: {
        width: "100%",
        height: "100%",
    },
    infoContainer: {
        padding: "20px",
        color: "white", textTransform: "lowercase",
        fontFamily: "Courier New",
    },
    table: {
        margin: "auto",
    },
    leftCell: {
        padding: "10px",
        textAlign: "left",
    },
    rightCell: {
        padding: "10px",
        textAlign: "right"
    }
}
