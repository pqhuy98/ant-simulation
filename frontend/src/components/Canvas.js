import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

export default function Canvas({ width, height, draw, next, fpsCalculator }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)
            fpsCalculator?.tick()

            draw(ctx)
            next()
        }
        render()
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw, next])

    return <canvas ref={canvasRef} width={width} height={height} />
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    next: PropTypes.func,
    fpsCalculator: PropTypes.object
}
