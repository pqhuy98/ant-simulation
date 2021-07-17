import React from "react"
import PropTypes from "prop-types"

export function FpsDisplay({ text, fpsValue, right }) {
    let style = {
        color: "white",
        right,
        position: "absolute",
    }
    return (
        <span style={style}>{text + ": " + fpsValue} </span >
        // <span style={style}>{~~(1000 / fpsValue)}ms {fpsValue} </span >
    )
}
FpsDisplay.propTypes = {
    text: PropTypes.string,
    fpsValue: PropTypes.string,
    right: PropTypes.string,
}