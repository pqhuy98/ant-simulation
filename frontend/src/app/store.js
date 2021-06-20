import { configureStore } from "@reduxjs/toolkit"
import worldReducer from "../game/World.reducer"

export const store = configureStore({
    reducer: {
        world: worldReducer,
    },
})
