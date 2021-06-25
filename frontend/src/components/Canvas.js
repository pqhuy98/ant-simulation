// @ts-nocheck
import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

export default function Canvas({ width, height, draw, next, fpsCalculator }) {
    const canvasRefBackground = useRef(null)
    const canvasRefTrailFood = useRef(null)
    const canvasRefTrailHome = useRef(null)
    const canvasRefAnt = useRef(null)
    const canvasRefFood = useRef(null)

    useEffect(() => {
        const ctxs = {
            ctxBackground: canvasRefBackground.current.getContext("2d"),
            ctxFoodTrail: canvasRefTrailFood.current.getContext("2d"),
            ctxHomeTrail: canvasRefTrailHome.current.getContext("2d"),
            ctxAnt: canvasRefAnt.current.getContext("2d"),
            ctxFood: canvasRefFood.current.getContext("2d"),
        }

        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)
            fpsCalculator?.tick()

            next()
            draw(ctxs)
        }
        render()
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw, next])

    let canvasStyle = {
        position: "absolute",
        height: "90%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
    }

    return <div style={{ height: "90%", display: "relative" }} >
        <canvas style={{ ...canvasStyle, zIndex: 1 }} ref={canvasRefBackground} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 2 }} ref={canvasRefTrailFood} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 3 }} ref={canvasRefTrailHome} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 4 }} ref={canvasRefAnt} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 5 }} ref={canvasRefFood} width={width} height={height} />
    </div >
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    next: PropTypes.func,
    fpsCalculator: PropTypes.object
}
