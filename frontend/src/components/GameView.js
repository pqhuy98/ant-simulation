// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import Canvas from "./Canvas"
import { FpsDisplay } from "./Fps"
import { GithubLink, Header, ThemeLinks } from "./Header"
// import config from "../config"

// import World from "antworld-shared/src/game/World"
// import { freshRNG } from "antworld-shared/src/game/Random"
import { FpsCalculator } from "antworld-shared/src/lib/fps"
import RawGameWorker from "worker-loader!../worker/game.worker"
import * as Comlink from "comlink"
import { useAsyncMemo } from "lib/custom_react_hooks"
import { revive } from "antworld-shared/src/game/GameObject/serializer"
import { Timer } from "antworld-shared/src/lib/performance"

console.log(RawGameWorker)
const GameWorker = Comlink.wrap(RawGameWorker())

let cycleTimer = new Timer()

export default function GameView({ theme, width, height }) {
    const [fps, setFps] = useState(0)
    const fpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setFps(fpsValue)
    }), [])

    const [workerFps, setWorkerFps] = useState(0)
    const workerFpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setWorkerFps(fpsValue)
    }), [])


    // https://stackoverflow.com/a/66071205
    const gameWorker = useAsyncMemo(async () => {
        let worker = await new GameWorker({ theme, width, height })
        return () => worker
    }, [width, height, theme])

    const worldRef = useRef(null)
    useEffect(() => {
        let canceled = false
        run()
        async function run() {
            while (!canceled && gameWorker) {
                cycleTimer.tick()
                let t = new Timer()
                let { data, profiler } = await gameWorker.nextAndGetFullState()
                console.log("next():", t.tick())

                let revived = revive(data)
                console.log("revive():", t.tick())
                console.log("full cycle:", cycleTimer.tick(), t.dt0())
                console.log(profiler)

                revived._AXS = true
                worldRef.current = revived
                workerFpsCalculator.tick()
            }
        }
        return () => {
            canceled = false
        }
    }, [gameWorker])

    const draw = useMemo(() => (...args) => worldRef.current?.render(...args), [])
    const next = useMemo(() => () => { }, [])


    let world = worldRef.current
    // Resize detection
    return <div style={style.container}>
        <Header>
            <ThemeLinks />
            <GithubLink />
            <FpsDisplay text="wFPS" fpsValue={workerFps} right="100px" />
            <FpsDisplay text="FPS" fpsValue={fps} right="20px" />
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
                    <td style={style.rightCell}> {world?.ants.length}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Gathered food: </td>
                    <td style={style.rightCell}> {world?.storedFood}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Ungathered food:</td>
                    <td style={style.rightCell}> {world?.unpickedFood}</td>
                </tr>
                <tr>
                    <td style={style.leftCell}>Transporting food: </td>
                    <td style={style.rightCell}> {world?.pickedFood}</td>
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
