import { randomColor, randomExp, randomInt } from "lib/basic_math"

// randomize Random.chemicalColor()
const transformers = [
    () => 0,
    () => 255,
    (val) => val,
    (val) => 255 - val
]

export const MODE_FOOD = 0
export const MODE_HOME = 1

export const Themes = {
    StarWar: {
        antColor0: "#37d3d2",
        antColor1: "#000000",
        foodColor: "#dfd",
        homeColor: "lightBlue",
        antCount: 2000,
        colonyCount: 3,
        foodClusters: 1216,
        foodSize: [1, 3],
        foodCapacity: [1, 20],
        chemicalColor: (val) => [0, val, val, 255],
        chemicalRenderMode: MODE_FOOD,
    },
    Classic: {
        antColor0: "#000000",
        antColor1: "brown",
        foodColor: "orange",
        homeColor: "brown",
        antCount: 2000,
        colonyCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],
        chemicalColor: (val) => [255, 255 - val, 255 - val, 255],
        chemicalRenderMode: MODE_HOME,
    },
    SpaceDesert: {
        antColor0: "#E2C141",
        antColor1: "#136961",
        antCount: 2000,
        chemicalColor: val => [255 - val, 255 - val, 0, val],
        chemicalRenderMode: 0,
        colonyCount: 2,
        foodCapacity: [1, 8],
        foodClusters: 1216,
        foodColor: "#BD8C41",
        foodSize: [1, 4],
        homeColor: "#72E95D",
    },
    FelColony: {
        antColor0: "#72F82A",
        antColor1: "#7AEC03",
        antCount: 2000,
        chemicalColor: val => [255 - val, 255, 255 - val, 255 - val],
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
    const fnIds = [
        randomInt(0, transformers.length),
        randomInt(0, transformers.length),
        randomInt(0, transformers.length),
        3
    ]
    console.log(fnIds)
    const fns = [
        transformers[fnIds[0]],
        transformers[fnIds[1]],
        transformers[fnIds[2]],
        transformers[fnIds[3]],
    ]
    let chemicalColor = (val) => [
        fns[0](val), fns[1](val), fns[2](val), fns[3](val)
    ]
    return {
        antColor0: randomColor(),
        antColor1: randomColor(),
        foodColor: randomColor(),
        homeColor: randomColor(),
        antCount: randomInt(1000, 5000),
        colonyCount: randomInt(1, 100),
        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
        chemicalColor,
        chemicalRenderMode: randomInt(0, 2),
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