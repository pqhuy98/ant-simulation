import React from "react"
import PropTypes from "prop-types"
import WorldStats from "./WorldStats"
import GameStats from "./GameStats"
import ControlPanel from "./ControlPanel"

export default function BottomView({ world, profiler, renderFilters, renderFilterSetters }) {
    return (<div style={styles.container}>
        <ControlPanel {...renderFilters} renderFilterSetters={renderFilterSetters} />
        <WorldStats
            totalAnts={world?.totalAnts}
            storedFood={world?.storedFood}
            unpickedFood={world?.unpickedFood}
            pickedFood={world?.pickedFood} />
        <GameStats profiler={profiler} />
    </div>)
}
BottomView.propTypes = {
    world: PropTypes.object,
    profiler: PropTypes.object,
    renderFilters: PropTypes.object,
    renderFilterSetters: PropTypes.object,
}

const styles = {
    container: {
        padding: "20px",
        color: "white", textTransform: "lowercase",
        fontFamily: "Courier New",
        display: "flex",
        flexDirection: "row",
    },
}