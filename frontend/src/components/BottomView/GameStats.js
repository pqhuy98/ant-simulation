import React from "react"
import PropTypes from "prop-types"

export default function GameStats({ profiler }) {
    for (const key in profiler) {
        if (!isNaN(profiler[key])) {
            profiler[key] = Math.round(profiler[key] * 100) / 100
        }
    }

    let profileJson = JSON.stringify(profiler, null, 2)
    if (Object.keys(profiler).length > 0) { // not empty object
        profileJson = profileJson.substring(2, profileJson.length - 1)
    } else {
        profileJson = ""
    }

    return (<pre style={{
        textAlign: "left", width: "400px",
        margin: "auto",
        marginRight: "10px",
        marginLeft: "10px",
    }}>
        {profileJson}
    </pre>)
}
GameStats.propTypes = {
    profiler: PropTypes.object,
}