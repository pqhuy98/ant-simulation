// @ts-nocheck
import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"
import { Profiler } from "lib/performance"

export default function Canvas({ width, height, draw, next, fpsCalculator }) {
    const canvasRefBackground = useRef(null)
    const canvasRefTrailFood = useRef(null)
    const canvasRefTrailHome = useRef(null)
    const canvasRefAnt = useRef(null)
    const canvasRefFood = useRef(null)
    const canvasRefWall = useRef(null)

    useEffect(() => {
        const ctxs = {
            ctxBackground: canvasRefBackground.current.getContext("2d"),
            ctxFoodTrail: canvasRefTrailFood.current.getContext("2d"),
            ctxHomeTrail: canvasRefTrailHome.current.getContext("2d"),
            ctxAnt: canvasRefAnt.current.getContext("2d"),
            ctxFood: canvasRefFood.current.getContext("2d"),
            ctxWall: canvasRefWall.current.getContext("2d"),
        }

        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)
            fpsCalculator?.tick()

            let profiler = new Profiler()

            next({ profiler })
            draw({ profiler, ...ctxs })

            profiler.put("TOTAL", (profiler.get("gameLoop : TOTAL") || 0) + (profiler.get("render : TOTAL") || 0))
            profiler.print()
        }
        render()
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw, next])

    return <div style={{
        width: window.innerWidth + "px",
        height: (height * window.innerWidth / width) + "px",
        ...style.container
    }} >
        <canvas style={{ ...style.canvas, zIndex: 1 }} ref={canvasRefBackground} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 2 }} ref={canvasRefTrailFood} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 3 }} ref={canvasRefTrailHome} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 4 }} ref={canvasRefAnt} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 5 }} ref={canvasRefFood} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 6 }} ref={canvasRefWall} width={width} height={height} />
    </div >
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    next: PropTypes.func,
    fpsCalculator: PropTypes.object
}

const style = {
    container: {
        position: "relative",
        textAlign: "left",
    },
    canvas: {
        position: "absolute",
        width: "100%",
        height: "100%",
    }
}