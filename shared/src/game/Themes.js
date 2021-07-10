const { SHAPE_CIRCLE, SHAPE_RANDOM, SHAPE_SQUARE } = require("./Food")
const { randomColor, randomExp, randomInt } = require("../lib/basic_math")

const Themes = {
    Classic: {
        colonyCount: 2,
        antColor: ["#000000", "#881111"],
        homeColor: "brown",
        foodColor: "orange",
        backgroundColor: "#ffffff",
        antCount: 3000,
        colonyHomeCount: 3,
        foodClusters: 100,
        foodSize: [10, 20],
        foodCapacity: [1, 5],
        caveScale: 1.5,
        caveBorder: 3,
    },
    Black: {
        colonyCount: 1,
        antColor: "#000",
        homeColor: "#000",
        antCount: 3301,
        backgroundColor: "#fff",
        colonyHomeCount: 10,
        foodCapacity: [1, 1],
        foodClusters: 14,
        foodColor: "#000",
        foodSize: [80, 100],
    },
    White: {
        colonyCount: 1,
        antColor: "#fff",
        antCount: 2301,
        backgroundColor: "#000",
        colonyHomeCount: 10,
        foodCapacity: [1, 3],
        foodClusters: 17,
        foodColor: "#fff",
        foodSize: [80, 100],
        homeColor: "#fff",
    },
    Lava: {
        colonyCount: 2,
        antColor: "#F8F08B",
        homeColor: "#7F0B34",
        antCount: 4481,

        colonyHomeCount: 1,

        backgroundColor: "#94392C",
        foodCapacity: [1, 6],
        foodClusters: 6112,
        foodColor: "#FC9E10",
        foodShape: SHAPE_CIRCLE,
        foodSize: [1, 2],
        caveScale: 3,
        caveBorder: 2,
    },
    FelColony: {
        antCount: 2000,

        colonyCount: 1,
        colonyHomeCount: 6,
        antColor: "#32A82A",
        homeColor: "#ffff7f",


        foodClusters: 1231,
        foodSize: [1, 11],
        foodCapacity: [1, 3],
        foodColor: "#78FF26",
    },
    Violet: {
        antCount: 2801,

        colonyCount: 1,
        colonyHomeCount: 30,
        antColor: "#7BE5EC",
        homeColor: "#0F03A9",

        foodClusters: 5576,
        foodSize: [1, 8],
        foodCapacity: [1, 2],
        foodColor: "#E49FF7",

        backgroundColor: "#7B39D3",
    },
    StarWar: {
        antCount: 2000,

        colonyCount: 1,
        colonyHomeCount: 3,
        antColor: "#37d3d2",
        homeColor: "lightBlue",

        foodClusters: 2216,
        foodSize: [1, 1],
        foodCapacity: [1, 4],
        foodColor: "#ddffdd",
        foodShape: SHAPE_CIRCLE,

        backgroundColor: "#000",
    },
    SpaceDesert: {
        antCount: 2000,

        colonyCount: 1,
        colonyHomeCount: 2,
        antColor: "#E2C141",
        homeColor: "#72E95D",

        foodClusters: 1216,
        foodSize: [1, 4],
        foodCapacity: [1, 2],
        foodColor: "#BD8C41",

        backgroundColor: "#101000",
    },
    Forest: {
        antCount: 3301,

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
    },
    Underground: {
        antCount: 5001,

        colonyCount: 1,
        colonyHomeCount: 2,
        antColor: randomColor(),// "#67799d",
        homeColor: randomColor(),// "#000",

        foodClusters: 7000,
        foodSize: [20, 30],
        foodCapacity: [1, 1],
        foodColor: "#684132",

        caveScale: 1,
        caveBorder: 2,
        backgroundColor: "#fff",
    },
    Bricks: {
        antCount: 1293,

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
    },
    Underwater: {
        antCount: 3494,

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
    },
    PathFinding: {},
    RANDOM: {
        antCount: randomInt(1000, 5000),

        colonyCount: randomInt(1, 4),
        colonyHomeCount: randomInt(1, 10),
        antColor: randomColor(),
        homeColor: randomColor(),

        foodClusters: Math.round(randomExp(5, 10000)),
        foodSize: [1, Math.round(randomExp(1, 200))],
        foodCapacity: [1, Math.round(randomExp(1, 20))],
        foodColor: randomColor(),
        foodShape: SHAPE_RANDOM,

        caveScale: Math.random() > 0.5 ? randomExp(1, 15) : 0,
        caveBorder: Math.random() > 0.5 ? 2 : 0,
        backgroundColor: randomColor(),
    }
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