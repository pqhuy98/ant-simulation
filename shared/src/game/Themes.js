const { SHAPE_CIRCLE, SHAPE_RANDOM, SHAPE_SQUARE } = require("./Food")
const { randomColor, randomExp, randomInt } = require("../lib/basic_math")

const Themes = {
    Black: {
        antColor: "#000",
        homeColor: "#000",
        antCount: 3301,
        backgroundColor: "#fff",
        colonyCount: 10,
        foodCapacity: [1, 1],
        foodClusters: 14,
        foodColor: "#000",
        foodSize: [80, 100],
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
    Lava: {
        antColor: "#F8F08B",
        antCount: 4481,
        backgroundColor: "#94392C",
        colonyCount: 1,
        foodCapacity: [1, 6],
        foodClusters: 6112,
        foodColor: "#FC9E10",
        foodShape: SHAPE_CIRCLE,
        foodSize: [1, 2],
        homeColor: "#7F0B34",
        caveScale: 3,
        caveBorder: 2,
    },
    FelColony: {
        antColor: "#72F82A",
        homeColor: "#ffff7f",
        antCount: 2000,
        colonyCount: 6,
        foodCapacity: [1, 3],
        foodClusters: 123,
        foodColor: "#78F126",
        foodSize: [1, 11],
    },
    Violet: {
        antColor: "#7BE5EC",
        antCount: 2801,
        backgroundColor: "#7B39D3",
        colonyCount: 30,
        foodCapacity: [1, 2],
        foodClusters: 5576,
        foodColor: "#E49FF7",
        foodSize: [1, 8],
        homeColor: "#0F03A9",
    },
    StarWar: {
        antColor: "#37d3d2",
        foodColor: "#ddffdd",
        homeColor: "lightBlue",
        backgroundColor: "#000",
        antCount: 2000,
        colonyCount: 3,
        foodClusters: 2216,
        foodSize: [1, 1],
        foodCapacity: [1, 4],
        foodShape: SHAPE_CIRCLE
    },
    SpaceDesert: {
        antColor: "#E2C141",
        homeColor: "#72E95D",
        foodColor: "#BD8C41",
        backgroundColor: "#101000",
        antCount: 2000,
        colonyCount: 2,
        foodCapacity: [1, 2],
        foodClusters: 1216,
        foodSize: [1, 4],
    },
    Forest: {
        antColor: "#83f1d1",
        antCount: 3301,
        backgroundColor: "#7b46a1",
        colonyCount: 10,
        foodCapacity: [10, 20],
        foodClusters: 100,
        foodColor: "#78f21a",
        foodSize: [10, 15],
        homeColor: "#83f1d1",
        foodShape: SHAPE_CIRCLE,
    },
    Underground: {
        antColor: randomColor(),// "#67799d",
        antCount: 5001,
        backgroundColor: "#fff",
        colonyCount: 2,
        foodCapacity: [1, 1],
        foodClusters: 7000,
        foodColor: "#684132",
        foodSize: [20, 30],
        homeColor: randomColor(),// "#000",
        caveScale: 1,
        caveBorder: 2,
    },
    Bricks: {
        antColor: "#BF6C4A",
        antCount: 1293,
        backgroundColor: "#339BF2",
        colonyCount: 1,
        foodCapacity: [1, 5],
        foodClusters: 409,
        foodColor: "#271F6A",
        foodSize: [1, 54],
        homeColor: "#42DF55",
        foodShape: SHAPE_SQUARE
    },
    Underwater: {
        antColor: "#7BB3D4",
        antCount: 3494,
        backgroundColor: "#0C0147",
        caveScale: 10,
        // caveFlip: true,
        colonyCount: 1,
        foodCapacity: [1, 2],
        foodClusters: 20,
        foodColor: "#3A4DFA",
        foodShape: SHAPE_CIRCLE,
        foodSize: [1, 28],
        homeColor: "orange" //"#58AD3E",
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
        caveScale: 1.5,
        caveBorder: 3,
    },
    PathFinding: {},
    RANDOM: {
        antColor: randomColor(),
        foodColor: randomColor(),
        homeColor: randomColor(),
        backgroundColor: randomColor(),
        antCount: randomInt(1000, 5000),
        colonyCount: randomInt(1, 10),
        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
        foodShape: SHAPE_RANDOM,
        caveScale: Math.random() > 0.5 ? randomExp(1, 15) : 0,
        caveBorder: Math.random() > 0.5 ? 2 : 0,
    }
}
Themes.PathFinding = {
    ...Themes.Classic,
    colonyCount: 1,
    foodCapacity: [1, 3],
    foodClusters: 3,
    foodSize: [30, 30],
}

// theme getter setter
const theme = { _: Themes.Classic }
function selectTheme(th) {
    theme._ = th
    console.log(th)
}
function t() {
    return theme._
}


const DevelopmentThemes = {
    Tiny: {
        antColor: "#000",
        antCount: 3,
        backgroundColor: "#fff",
        colonyCount: 1,
        foodCapacity: [1, 1],
        foodClusters: 3,
        foodColor: "#000",
        foodSize: [2, 3],
        homeColor: "#000",
    },
}
module.exports = {
    Themes,
    DevelopmentThemes,
    selectTheme,
    t,
}