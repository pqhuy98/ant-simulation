// @ts-nocheck
import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import Canvas from "./Canvas"
import { FpsDisplay } from "./Fps"
import { GithubLink, Header, ThemeLinks } from "./Header"
import config from "../config"

import World from "antworld-shared/src/game/World"
import { FpsCalculator } from "antworld-shared/src/lib/fps"
import { freshRNG } from "antworld-shared/src/game/Random"

export default function GameView({ worldObj, theme, width, height }) {
    const world = useMemo(() => {
        if (worldObj) return world
        else return new World({
            width, height,
            specs: {
                ...theme,
                antSpeedMin: config.ANT_SPEED_MIN,
                antSpeedMax: config.ANT_SPEED_MAX,
            },
            rng: freshRNG(),
            // rng: new Random(1, 0, 1),
        })
    }, [theme, worldObj])

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
    worldObj: PropTypes.object,
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
