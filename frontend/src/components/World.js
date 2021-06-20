import React from "react"
import {
    useSelector,
    // useDispatch
} from "react-redux"
import { Stage, Layer } from "react-konva"

import { selectAnts } from "../game/World.reducer"

import Ant from "./Ant"

export default function World() {
    const ants = useSelector(selectAnts)
    // const dispatch = useDispatch()
    console.log(ants)

    return (
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                {ants.map(ant => <Ant key={ant.id} {...ant} />)}
            </Layer>
        </Stage>
    )
}