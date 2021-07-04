// @ts-nocheck
import React from "react"
import PropTypes from "prop-types"

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