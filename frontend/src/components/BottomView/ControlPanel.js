import React from "react"
import PropTypes from "prop-types"

export default function ControlPanel({ renderFilterSetters, ...filters }) {
    // const [filterSettings, setFilterSettings] = React.useState({ ...filters });

    return (<div style={styles.container}>
        {Object.keys(filters).map((filterName) => {
            return <label key={filterName}>
                <input type="checkbox"
                    defaultChecked={!filters[filterName]}
                    onChange={() => {
                        console.log(filterName, renderFilterSetters[filterName])
                        renderFilterSetters[filterName](!filters[filterName])
                    }} />
                {filterName}
                <br />
            </label>
        })}
    </div>)
}
ControlPanel.propTypes = {
    renderFilterSetters: PropTypes.object,
}

const styles = {
    container: {
        textAlign: "left",
        flexGrow: 4,
    }
}