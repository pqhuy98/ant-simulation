import React from "react"
import PropTypes from "prop-types"
import { Circle } from "react-konva"

export default function Ant(props) {
    const { id, position } = props
    return (
        <Circle
            id={id.toString()}
            x={position.x}
            y={position.y}
            fill="black"
            radius={2}
        />
    )
}

Ant.propTypes = {
    id: PropTypes.string,
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    })
}