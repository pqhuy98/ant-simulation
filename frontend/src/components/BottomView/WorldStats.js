import React from "react"
import PropTypes from "prop-types"

export default function WorldStats({ width, height, totalAnts, storedFood, unpickedFood, pickedFood }) {
    return (<table style={styles.table}><tbody>
        <tr>
            <td style={styles.leftCell}>World size:</td>
            <td style={styles.rightCell}> {width}×{height} </td>
        </tr>
        <tr>
            <td style={styles.leftCell}>Ant population:</td>
            <td style={styles.rightCell}> {totalAnts}</td>
        </tr>
        <tr>
            <td style={styles.leftCell}>Gathered food: </td>
            <td style={styles.rightCell}> {storedFood}</td>
        </tr>
        <tr>
            <td style={styles.leftCell}>Ungathered food:</td>
            <td style={styles.rightCell}> {unpickedFood}</td>
        </tr>
        <tr>
            <td style={styles.leftCell}>Transporting food: </td>
            <td style={styles.rightCell}> {pickedFood}</td>
        </tr>
    </tbody></table>)
}
WorldStats.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    totalAnts: PropTypes.number,
    storedFood: PropTypes.number,
    unpickedFood: PropTypes.number,
    pickedFood: PropTypes.number,
}

const styles = {
    table: {
        margin: "auto",
        marginRight: "10px",
        marginLeft: "10px",
    },
    leftCell: {
        padding: "10px",
        textAlign: "left",
    },
    rightCell: {
        padding: "10px",
        textAlign: "right"
    }
}