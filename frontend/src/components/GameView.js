// @ts-nocheck
import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import Canvas from "./Canvas"
import { FpsDisplay } from "./Fps"
import { GithubLink, Header, ThemeLinks } from "./Header"
import { FpsCalculator } from "antworld-shared/src/lib/fps"
import RawGameWorker from "worker-loader!../worker/game.worker"
import * as Comlink from "comlink"
import { useAsyncMemo, useWorldRefFromGameWorker } from "lib/custom_react_hooks"
import { Timer } from "antworld-shared/src/lib/performance"
import Renderer from "renderer/Renderer"

console.log(RawGameWorker)
const GameWorker = Comlink.wrap(RawGameWorker())

let cycleTimer = new Timer()

var _t = performance.now()
export default function GameView({ theme, width, height, trailScale }) {
    const [fps, setFps] = useState(0)
    const fpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setFps(fpsValue)
    }), [])

    const [workerFps, setWorkerFps] = useState(0)
    const workerFpsCalculator = useMemo(() => new FpsCalculator({
        onTick: (fpsValue) => setWorkerFps(fpsValue)
    }), [])

    const [savedProfiler, setSavedProfiler] = useState("")


    // https://stackoverflow.com/a/66071205
    const gameWorker = useAsyncMemo(async () => {
        let worker = await new GameWorker({ theme, width, height, trailScale })
        return () => worker
    }, [width, height, theme, trailScale])

    const worldRef = useWorldRefFromGameWorker({
        gameWorker,
        postIteration: ({ profiler }) => {
            workerFpsCalculator?.tick()
            false && cycleTimer?.tick()
            if (performance.now() - _t > 2000) {
                _t = performance.now()
                setSavedProfiler(profiler)
            }
        }
    })

    const renderer = useMemo(() => new Renderer({
        worldRef,
        postRender: ({ profiler }) => {
            fpsCalculator.tick()
            false && profiler.print("total_render")
        }
    }), [worldRef])

    const draw = useMemo(() => (...args) => renderer.render(...args), [])

    let world = worldRef.current

    let profileJson = JSON.stringify(savedProfiler, null, 2)
    profileJson = profileJson.substring(2, profileJson.length - 1)

    // Resize detection
    return <div style={style.container}>
        <Header>
            <ThemeLinks />
            <GithubLink />
            <FpsDisplay text="wf" fpsValue={workerFps} right="100px" />
            <FpsDisplay text="FPS" fpsValue={fps} right="20px" />
        </Header>
        <Canvas
            width={width}
            height={height}
            draw={draw}
            homeTrailCount={world?.colonies.length}
            trailScale={world?.trailScale}
        />
        <div style={style.infoContainer}>
            <table style={style.table}><tbody>
                <tr>
                    <td style={style.leftCell}>Ant population:</td>
                    <td style={style.rightCell}> {world?.totalAnts}</td>
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
            <pre style={{
                textAlign: "left", width: "400px",
                margin: "auto",
                marginLeft: "10px",
            }}>
                {profileJson}
            </pre>
        </div>
    </div >
}
GameView.propTypes = {
    worldObj: PropTypes.object,
    theme: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    trailScale: PropTypes.number,
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
