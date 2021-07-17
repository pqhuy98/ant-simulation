// @ts-nocheck
import React, { useMemo, useRef, useState } from "react"
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
import BottomView from "./BottomView"
import World from "antworld-shared/src/game/World"

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

    const [savedProfiler, setSavedProfiler] = useState({})

    // https://stackoverflow.com/a/66071205
    const gameWorker = useAsyncMemo(async () => {
        console.log(theme)
        let worker = await new GameWorker({ theme, width, height, trailScale })
        return () => worker
    }, [width, height, theme, trailScale])

    const worldRef = useWorldRefFromGameWorker({
        gameWorker,
        postIteration: ({ profiler }) => {
            workerFpsCalculator?.tick()
            false && cycleTimer?.tick()
            if (performance.now() - _t > 500) {
                _t = performance.now()
                setSavedProfiler(profiler)
            }
        }
    })

    const renderFiltersRef = useRef(World.defaultRenderFilters())

    const renderer = useMemo(() => new Renderer({
        worldRef,
        renderFiltersRef,
        postRender: ({ profiler }) => {
            fpsCalculator.tick()
            false && profiler.print("total_render")
        }
    }), [worldRef, renderFiltersRef])
    const draw = useMemo(() => (...args) => renderer.render(...args), [])

    const renderFilterSetters = renderer.buildFilterSetters(renderFiltersRef)
    let world = worldRef.current

    return <div style={styles.container}>
        <Header>
            <ThemeLinks />
            <GithubLink />
            {/* <FpsDisplay text="wf" fpsValue={workerFps} right="100px" /> */}
            <FpsDisplay text="FPS" fpsValue={fps + "/" + workerFps} right="20px" />
        </Header>

        <Canvas
            width={width}
            height={height}
            draw={draw}
            homeTrailCount={world?.colonies.length}
            trailScale={world?.trailScale} />

        <BottomView
            world={world} profiler={savedProfiler}
            renderFilters={renderFiltersRef.current}
            renderFilterSetters={renderFilterSetters} />
    </div >
}
GameView.propTypes = {
    worldObj: PropTypes.object,
    theme: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    trailScale: PropTypes.number,
}

const styles = {
    container: {
        width: "100%",
        height: "100%",
    },
}
