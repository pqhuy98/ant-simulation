const { SHAPE_CIRCLE, SHAPE_RANDOM, SHAPE_SQUARE } = require("./Food")
const { randomColor, randomExp, randomInt } = require("../lib/basic_math")

const Themes = {
    Classic: {
        antCount: 30000,

        colonyCount: 1,
        antColor: "#000000",
        homeColor: "brown",
        foodColor: "orange",
        colonyHomeCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],

        caveScale: 2,
        caveBorder: 3,
        backgroundColor: "#ffffff",

        constrast: 0.2,
    },
    Black: {
        colonyCount: 1,
        antColor: "#000",
        homeColor: "#000",
        antCount: 25010,
        backgroundColor: "#fff",
        colonyHomeCount: 10,
        foodCapacity: [1, 1],
        foodClusters: 14,
        foodColor: "#000",
        foodSize: [80, 100],
        constrast: 0.4,
    },
    White: {
        colonyCount: 1,
        antColor: "#fff",
        antCount: 23010,
        backgroundColor: "#000",
        colonyHomeCount: 10,
        foodCapacity: [1, 3],
        foodClusters: 17,
        foodColor: "#fff",
        foodSize: [80, 100],
        homeColor: "#fff",
        constrast: 0.4,
    },
    Lava: {
        colonyCount: 1,
        antColor: "#F8F08B",
        homeColor: "#7F0B34",
        antCount: 24810,

        colonyHomeCount: 1,

        backgroundColor: "#94392C",
        foodCapacity: [1, 6],
        foodClusters: 6112,
        foodColor: "#FC9E10",
        foodShape: SHAPE_CIRCLE,
        foodSize: [1, 2],
        caveScale: 4,
        caveBorder: 2,
        constrast: 0.4,
    },
    FelColony: {
        antCount: 20000,

        colonyCount: 1,
        colonyHomeCount: 6,
        antColor: "#000",//"#32A82A",
        homeColor: "#ffff7f",


        foodClusters: 1231,
        foodSize: [1, 11],
        foodCapacity: [1, 3],
        foodColor: "#78FF26",
        constrast: 0.3,
    },
    Violet: {
        antCount: 28010,

        colonyCount: 1,
        colonyHomeCount: 30,
        antColor: "#7BE5EC",
        homeColor: "#0F03A9",

        foodClusters: 5576,
        foodSize: [1, 8],
        foodCapacity: [1, 2],
        foodColor: "#E49FF7",

        backgroundColor: "#7B39D3",
        constrast: 0.3,
    },
    StarWar: {
        antCount: 20000,

        colonyCount: 1,
        colonyHomeCount: 3,
        antColor: "#37d3d2",
        homeColor: "lightBlue",

        foodClusters: 2216,
        foodSize: [1, 1],
        foodCapacity: [1, 20],
        foodColor: "#ddffdd",
        foodShape: SHAPE_CIRCLE,

        backgroundColor: "#000",
        constrast: 0.5,
    },
    SpaceDesert: {
        antCount: 20000,

        colonyCount: 1,
        colonyHomeCount: 2,
        antColor: "#E2C141",
        homeColor: "#72E95D",

        foodClusters: 1216,
        foodSize: [1, 4],
        foodCapacity: [1, 2],
        foodColor: "#BD8C41",

        backgroundColor: "#101000",
        constrast: 0.4,
    },
    Forest: {
        antCount: 23010,

        colonyCount: 1,
        colonyHomeCount: 10,
        antColor: "#83f1d1",
        homeColor: "#83f1d1",

        foodCapacity: [10, 20],
        foodClusters: 100,
        foodColor: "#78f21a",
        foodSize: [10, 15],
        foodShape: SHAPE_CIRCLE,

        backgroundColor: "#7b46a1",
        constrast: 0.3,
    },
    Underground: {
        antCount: 24010,

        colonyCount: 1,
        colonyHomeCount: 2,
        antColor: randomColor(),// "#67799d",
        homeColor: randomColor(),// "#000",

        foodClusters: 7000,
        foodSize: [20, 30],
        foodCapacity: [1, 1],
        foodColor: "#684132",

        caveScale: 1.5,
        caveBorder: 2,
        backgroundColor: "#fff",
        constrast: 0.35,
    },
    Bricks: {
        antCount: 12930,

        colonyCount: 1,
        colonyHomeCount: 1,
        antColor: "#BF6C4A",
        homeColor: "#42DF55",

        foodClusters: 409,
        foodSize: [1, 54],
        foodCapacity: [1, 5],
        foodColor: "#271F6A",
        foodShape: SHAPE_SQUARE,

        backgroundColor: "#339BF2",
        constrast: 0.2,
    },
    Underwater: {
        antCount: 34940,

        colonyCount: 1,
        colonyHomeCount: 1,
        antColor: "#7BB3D4",
        homeColor: "orange", //"#58AD3E",

        foodClusters: 20,
        foodSize: [1, 28],
        foodCapacity: [1, 2],
        foodColor: "#3A4DFA",
        foodShape: SHAPE_CIRCLE,

        caveScale: 10,
        // caveFlip: true,
        backgroundColor: "#0C0147",
        constrast: 0.2,
    },
    PathFinding: {},
    RANDOM: (() => {
        let colonyCount = randomInt(1, 5)
        return {
            antCount: Math.round(randomExp(5000, 30000)),

            colonyCount,
            colonyHomeCount: randomInt(1, 10),
            antColor: Array(colonyCount).fill(0).map(() => randomColor()),
            homeColor: Array(colonyCount).fill(0).map(() => randomColor()),

            foodClusters: Math.round(randomExp(5, 10000)),
            foodSize: [1, Math.round(randomExp(1, 200))],
            foodCapacity: [1, Math.round(randomExp(1, 20))],
            foodColor: randomColor(),
            foodShape: SHAPE_RANDOM,

            caveScale: Math.random() > 0.5 ? randomExp(1, 15) : 0,
            caveBorder: Math.random() > 0.5 ? 2 : 0,
            backgroundColor: randomColor(),
            constrast: randomExp(0.25, 0.5),
        }
    })(),
}
Themes.PathFinding = {
    ...Themes.Classic,
    colonyCount: 1,
    colonyHomeCount: 1,
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
        colonyHomeCount: 1,
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