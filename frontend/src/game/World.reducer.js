import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    ants: [...Array(10)].map((_, i) => randomAnt({ id: i })),
}

function randomAnt({ id }) {
    return {
        id: id.toString(),
        position: {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
        },
        velocity: {
            x: 0,
            y: 0,
        },
    }
}

const FPS = 60;
const deltaT = 1000 / FPS;

const worldSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        addRandomAnt: (state) => {
            state.ants.push(randomAnt({ id: state.ants.length }))
        },

        killAnt: (state, action) => {
            let killedId = action.payload.id
            state.ants = state.ants.filter(ant => (ant.id !== killedId))
        },

        gameLoop: (state) => {
            state.ants.forEach(ant => {
                ants
            })
        }
    },
})

export const selectAnts = (state) => state.world.ants
export const { addRandomAnt, killAnt } = worldSlice.actions
export default worldSlice.reducer
