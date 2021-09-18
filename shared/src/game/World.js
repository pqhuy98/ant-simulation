const Ant = require("./Ant/Ant")
const { Food } = require("./Food")
const { directPixelManipulation } = require("../lib/canvas_optimizer")
const { NullProfiler, Profiler } = require("../lib/performance")
const Wall = require("./Wall")
const { freshRNG } = require("./Random")

const ChemicalMap2x2 = require("./ChemicalMap/ChemicalMap_2x2")
const ChemicalMap3x3 = require("./ChemicalMap/ChemicalMap_3x3")
const { GameObject } = require("./GameObject")
const Colony = require("./Ant/Colony")

console.log("VERSION:", "serializable")

class World extends GameObject {
    registerId() { return (this.currentId++).toString() }

    constructor({ width, height, specs, trailScale, rng, postProcessFn }) {
        super()
        this.currentId = 0
        this._id = this.registerId()
        this.width = width
        this.height = height
        this.version = 0
        this.postProcessFn = postProcessFn || (() => { })
        this.deltaT = 1 / 30 // ms
        this.backgroundColor = specs.backgroundColor
        this.antSpeedMin = specs.antSpeedMin
        this.antSpeedMax = specs.antSpeedMax
        this.specs = specs
        this.trailScale = trailScale
        this.disabledRenders = World.defaultRenderFilters()

        // Random
        this.r = rng || freshRNG()

        // Wall
        this.wall = new Wall({
            world: this,
            width, height,
            scale: specs.caveScale,
            flip: specs.caveFlip,
            border: specs.caveBorder
        })

        // Food
        let CM = this.r.pickRandomWithProbabilities([ChemicalMap3x3, ChemicalMap2x2], [0.8])
        console.log(CM)
        this.foodTrail = new CM({
            world: this, name: "food",
            width, height,
            color: specs.foodColor,
            evaporate: 0.9
        })
        this.food = new Food({
            world: this,
            width, height,
            clustersCount: specs.foodClusters,
            size: specs.foodSize,
            capacity: specs.foodCapacity,
            color: specs.foodColor,
            shape: specs.foodShape
        })
        this.foodColor = specs.foodColor

        // Ant
        this.colonyCount = specs.colonyCount
        this.colonies = []
        for (let i = 0; i < this.colonyCount; i++) {
            this.colonies.push(new Colony({
                world: this,
                capacity: specs.antCount / this.colonyCount,
                antColor: Array.isArray(specs.antColor) ? specs.antColor[i] : specs.antColor,
                homeColor: Array.isArray(specs.homeColor) ? specs.homeColor[i] : specs.homeColor,
                homeCount: specs.colonyHomeCount,
            }))
        }
    }

    serializableKeys() {
        return Object.keys(this).filter(k => k !== "disabledRenders")
    }

    get totalAnts() {
        let sum = 0
        this.colonies.forEach((c) => sum += c.ants.length)
        return sum
    }
    get storedFood() {
        let sum = 0
        this.colonies.forEach((c) => sum += c.storedFood)
        return sum
    }
    get unpickedFood() { return this.food.remaining }
    get pickedFood() {
        let sum = 0
        this.colonies.forEach((c) => sum += c.pickedFood)
        return sum
    }

    gameLoop({ profiler }) {
        profiler = profiler || new NullProfiler()
        this.version++

        // pre-gameLoop
        this.food.preGameLoop()
        profiler.tick()

        // Game loop for colonies
        this.colonies.forEach((colony, i) => {
            colony.gameLoop(profiler)
        })
        profiler.tick("gameLoop::colonies")

        // Food and food trail
        this.food.gameLoop()
        profiler.tick("gameLoop::food")

        this.foodTrail.gameLoop({
            checkIsCovered: (i) => {
                return this.food.hasAtIdx(i)
            }
        })
        profiler.tick("gameLoop::food trail")

        // Wall
        this.wall.gameLoop()
        profiler.tick("gameLoop::wall")
        profiler.put("total", profiler.elapse())

        // trigger post process
        if (typeof this.postProcessFn === "function") {
            this.postProcessFn(this)
        }
    }

    render({
        profiler, step, extraTime,
        ctxBackground, ctxFoodTrail, ctxHomeTrail, ctxAnt, ctxHome, ctxFood, ctxWall
    }) {
        extraTime = Math.min(1, extraTime)
        profiler = profiler || new NullProfiler()

        // render background
        ctxBackground.fillStyle = this.backgroundColor
        ctxBackground.fillRect(0, 0, this.width, this.height)
        profiler.tick("render : background")

        // render ant colony
        ctxAnt.clearRect(0, 0, ctxAnt.canvas.width, ctxAnt.canvas.height)
        ctxHome.clearRect(0, 0, ctxAnt.canvas.width, ctxAnt.canvas.height)
        delete ctxAnt.bitmap
        this.colonies.forEach((colony, i) => {
            colony.render({
                profiler, extraTime,
                ctxAnt, ctxHomeTrail: ctxHomeTrail[i],
                ctxHome,
            })
        })

        this.foodTrail.render({ profiler, ctx: ctxFoodTrail })

        // render food
        this.food.render({ profiler, ctx: ctxFood })

        // render wall
        this.wall.render(ctxWall)
        profiler.tick("render : wall")
        profiler.put("total_render", profiler.elapse())
    }

    static defaultRenderFilters() {
        return {
            antsToHome: false,
            antsToFood: false,
            food: false,
            wall: false,
            home: false,
        }
    }
}

module.exports = World