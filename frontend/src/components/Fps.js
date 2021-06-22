import React from "react"
import PropTypes from "prop-types"

export class FpsCalculator {
    constructor({ onTick }) {
        this.times = []
        this.frameCount = 0
        this.onTick = onTick
    }

    tick() {
        let now = performance.now()
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
            this.times.shift()
        }
        this.times.push(now)
        this.frameCount++
        this.onTick(this.get())
    }

    get() {
        return this.times.length
    }
}

export function FpsDisplay({ fpsValue }) {
    let style = {
        color: "white",
        right: "20px",
        position: "absolute",
    }
    return (
        <span style={style}>{"FPS: " + fpsValue} </span >
        // <span style={style}>{Math.floor(1000 / fpsValue)}ms {fpsValue} </span >
    )
}
FpsDisplay.propTypes = {
    fpsValue: PropTypes.number,
}