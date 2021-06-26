import { SHAPE_CIRCLE, SHAPE_SQUARE } from "game/Food"
import { pickRandom, randomColor, randomExp, randomInt } from "lib/basic_math"

export const Themes = {
    StarWar: {
        antColor: "#37d3d2",
        foodColor: "#ddffdd",
        homeColor: "lightBlue",
        backgroundColor: "#000",
        antCount: 2000,
        colonyCount: 3,
        foodClusters: 1216,
        foodSize: [1, 3],
        foodCapacity: [1, 20],
        foodShape: () => SHAPE_CIRCLE
    },
    Black: {
        antColor: "#000",
        antCount: 3301,
        backgroundColor: "#fff",
        colonyCount: 10,
        foodCapacity: [1, 1],
        foodClusters: 14,
        foodColor: "#000",
        foodSize: [80, 100],
        homeColor: "#000",
    },
    White: {
        antColor: "#fff",
        antCount: 2301,
        backgroundColor: "#000",
        colonyCount: 10,
        foodCapacity: [1, 3],
        foodClusters: 17,
        foodColor: "#fff",
        foodSize: [80, 100],
        homeColor: "#fff",
    },
    SpaceDesert: {
        antColor: "#E2C141",
        homeColor: "#72E95D",
        foodColor: "#BD8C41",
        backgroundColor: "#101000",
        antCount: 2000,
        colonyCount: 2,
        foodCapacity: [1, 8],
        foodClusters: 1216,
        foodSize: [1, 4],
    },
    FelColony: {
        antColor: "#72F82A",
        antCount: 2000,
        colonyCount: 6,
        foodCapacity: [1, 8],
        foodClusters: 123,
        foodColor: "#78F126",
        foodSize: [1, 11],
        homeColor: "#ffff7f",
    },
    Violet: {
        antColor: "#7BE5EC",
        antCount: 2801,
        backgroundColor: "#7B39D3",
        colonyCount: 4,
        foodCapacity: [1, 10],
        foodClusters: 5576,
        foodColor: "#E49FF7",
        foodSize: [1, 8],
        homeColor: "#0F03A9",
    },
    Forest: {
        antColor: "#67799d",
        antCount: 2301,
        backgroundColor: "#7b46a1",
        colonyCount: 10,
        foodCapacity: [10, 20],
        foodClusters: 100,
        foodColor: "#78f21a",
        foodSize: [10, 15],
        homeColor: "#83f1d1",
    },
    Underground: {
        antColor: "#67799d",
        antCount: 5001,
        backgroundColor: "#fff",
        colonyCount: 2,
        foodCapacity: [1, 1],
        foodClusters: 7000,
        foodColor: "#1b0000",
        foodSize: [20, 30],
        homeColor: "#000",
    },
    Lego: {
        antColor: "#BF6C4A",
        antCount: 1293,
        backgroundColor: "#339BF2",
        colonyCount: 1,
        foodCapacity: [1, 5],
        foodClusters: 409,
        foodColor: "#271F6A",
        foodSize: [1, 54],
        homeColor: "#42DF55",
    },
    Classic: {
        antColor: "#000000",
        foodColor: "orange",
        homeColor: "brown",
        backgroundColor: "#ffffff",
        antCount: 3000,
        colonyCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],
    },
    PathFinding: {},
}
Themes.PathFinding = {
    ...Themes.Classic,
    colonyCount: 1,
    foodCapacity: [1, 3],
    foodClusters: 3,
    foodSize: [30, 30],
}

export function Random() {
    return {
        antColor: randomColor(),
        foodColor: randomColor(),
        homeColor: randomColor(),
        backgroundColor: randomColor(),
        antCount: randomInt(1000, 5000),
        colonyCount: randomInt(1, 10),
        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
        foodShape: pickRandom([() => SHAPE_CIRCLE, () => SHAPE_SQUARE, undefined])
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