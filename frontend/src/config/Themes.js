import { randomColor, randomExp, randomInt } from "lib/basic_math"

export const MODE_FOOD = 0
export const MODE_HOME = 1
export const themes = {
    StarWar: {
        antColor0: "#37d3d2",
        antColor1: "#000000",
        foodColor: "#dfd",
        homeColor: "lightBlue",
        antCount: 5000,
        colonyCount: 3,
        foodClusters: 1216,
        foodSize: [1, 3],
        foodCapacity: [1, 20],
        chemicalColor: (val) => [0, val, val, 255],
        chemicalRenderMode: MODE_FOOD,
    },
    Classic: {
        antColor0: "#000000",
        antColor1: "darkOrange",
        foodColor: "orange",
        homeColor: "brown",
        antCount: 2500,
        colonyCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],
        chemicalColor: (val) => [255, 255 - val, 255 - val, 255],
        chemicalRenderMode: MODE_HOME,
    },
    Surprise: {
        antColor0: randomColor(),
        antColor1: randomColor(),
        foodColor: randomColor(),
        homeColor: randomColor(),
        antCount: randomInt(1000, 5000),
        colonyCount: randomInt(1, 10),
        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
        chemicalColor: (val) => [255, 255 - val, 255 - val, 255],
        chemicalRenderMode: randomInt(0, 2),
    },
    SpaceDesert: {
        antColor0: "#E2C141",
        antColor1: "#136961",
        antCount: 4540,
        chemicalColor: val => [255 - val, 255 - val, 0, val],
        chemicalRenderMode: 0,
        colonyCount: 2,
        foodCapacity: [1, 8],
        foodClusters: 1216,
        foodColor: "#BD8C41",
        foodSize: [1, 4],
        homeColor: "#72E95D",
    },
}
// randomize Surprise.chemicalColor()
const transformers = [
    () => 0,
    () => 255,
    (val) => val,
    (val) => 255 - val
]
const fnIds = [
    randomInt(0, transformers.length),
    randomInt(0, transformers.length),
    randomInt(0, transformers.length),
    randomInt(0, transformers.length),
]
console.log(fnIds)
const fns = [
    transformers[fnIds[0]],
    transformers[fnIds[1]],
    transformers[fnIds[2]],
    transformers[fnIds[3]],
]
themes.Surprise.chemicalColor = (val) => [fns[0](val), fns[1](val), fns[2](val), fns[3](val)]

// theme getter setter
const theme = { _: themes.Classic }
export function selectTheme(th) {
    theme._ = th
    console.log(th)
}
export function t() {
    return theme._
}

// default theme
// selectTheme(themes.StarWar)
// selectTheme(themes.Classic)
selectTheme(themes.Surprise)
// selectTheme(themes.SpaceDesert)