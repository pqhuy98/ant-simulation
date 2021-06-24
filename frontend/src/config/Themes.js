import { randomColor, randomExp, randomInt } from "lib/basic_math"

export const MODE_FOOD = 0
export const MODE_HOME = 1

export const Themes = {
    StarWar: {
        antColor0: "#37d3d2",
        antColor1: "#ffffff",
        foodColor: "#ddffdd",
        homeColor: "lightBlue",
        backgroundColor: "#000",
        antCount: 3000,
        colonyCount: 3,
        foodClusters: 1216,
        foodSize: [1, 3],
        foodCapacity: [1, 20],
        chemicalColor: "#37d3d2",
        chemicalRenderMode: MODE_FOOD,
    },
    Classic: {
        antColor0: "#000000",
        antColor1: "brown",
        foodColor: "orange",
        homeColor: "brown",
        backgroundColor: "#ffffff",
        antCount: 2000,
        colonyCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],
        chemicalColor: "#ff0000",
        chemicalRenderMode: MODE_HOME,
    },
    SpaceDesert: {
        antColor0: "#E2C141",
        antColor1: "#136961",
        homeColor: "#72E95D",
        foodColor: "#BD8C41",
        backgroundColor: "#101000",
        chemicalColor: "#ffff00",
        chemicalRenderMode: 0,
        antCount: 2000,
        colonyCount: 2,
        foodCapacity: [1, 8],
        foodClusters: 1216,
        foodSize: [1, 4],
    },
    FelColony: {
        antColor0: "#72F82A",
        antColor1: "#7AEC03",
        antCount: 2000,
        chemicalColor: "#00ff00",
        chemicalRenderMode: 1,
        colonyCount: 6,
        foodCapacity: [1, 8],
        foodClusters: 23,
        foodColor: "#789196",
        foodSize: [1, 11],
        homeColor: "#ACF441",
    },
}
Themes.PathFinding = {
    ...Themes.Classic,
    antCount: 2000,
    colonyCount: 1,
    foodCapacity: [1, 3],
    foodClusters: 3,
    foodSize: [30, 30],
}

export function Random() {
    return {
        antColor0: randomColor(),
        antColor1: randomColor(),
        foodColor: randomColor(),
        homeColor: randomColor(),
        backgroundColor: randomColor(),
        chemicalColor: randomColor(),
        chemicalRenderMode: randomInt(0, 2),
        antCount: randomInt(1000, 5000),
        colonyCount: randomInt(1, 10),
        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
    }
}



// theme getter setter
const theme = { _: Themes.Classic }
export function selectTheme(th) {
    theme._ = th
    console.log(th)
}
export function t() {
    return theme._
}