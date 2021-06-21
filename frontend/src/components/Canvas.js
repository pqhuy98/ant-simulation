import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

class FpsCalculator {
    constructor() {
        this.times = []
        this.frameCount = 0
    }

    tick() {
        let now = performance.now()
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
            this.times.shift()
        }
        this.times.push(now)
        this.frameCount++
    }

    get() {
        return this.times.length
    }
}

export default function Canvas({ width, height, draw, next }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        let fpsCalculator = new FpsCalculator()
        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)
            fpsCalculator.tick()

            draw(ctx)

            ctx.font = "15px Arial"
            ctx.fillText(fpsCalculator.get(), 2, 15)
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
}
