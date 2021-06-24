// @ts-nocheck
import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

export default function Canvas({ width, height, draw, next, fpsCalculator }) {
    const canvasRef = useRef(null)
    const canvasRefAnt = useRef(null)
    const canvasRefFood = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const canvasAnt = canvasRefAnt.current
        const ctxAnt = canvasAnt.getContext("2d")

        const canvasFood = canvasRefFood.current
        const ctxFood = canvasFood.getContext("2d")

        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)
            fpsCalculator?.tick()

            draw({ ctx, ctxAnt, ctxFood })
            next()
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
        <canvas style={{ ...canvasStyle, zIndex: 1 }} ref={canvasRef} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 2 }} ref={canvasRefAnt} width={width} height={height} />
        <canvas style={{ ...canvasStyle, zIndex: 3 }} ref={canvasRefFood} width={width} height={height} />
    </div >
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    next: PropTypes.func,
    fpsCalculator: PropTypes.object
}
