const Ant = require("./Ant/Ant")
const AntPropertyCollection = require("./Ant/AntPropertyCollection")
const { Food } = require("./Food")
const Home = require("./Home")
const { directPixelManipulation } = require("../lib/canvas_optimizer")
const { NullProfiler, Profiler, Timer } = require("../lib/performance")
const Wall = require("./Wall")
const { freshRNG } = require("./Random")

// const ChemicalMap = require("./ChemicalMap-fast3x3")
const ChemicalMap = require("./ChemicalMap")
const ChemicalMap3x3 = require("./ChemicalMap-fast3x3")
const { GameObject } = require("./GameObject")

console.log("VERSION:", "serializable")

class World extends GameObject {
    registerId() { return (this.currentId++).toString() }

    constructor({ width, height, specs, rng, postProcessFn }) {
        super()
        this.currentId = 0
        this._id = this.registerId()
        this.width = width
        this.height = height
        this.version = 0
        this.pickedFood = 0
        this.unpickedFood = 0
        this.storedFood = 0
        this.postProcessFn = postProcessFn || (() => { })
        this.deltaT = 1 / 30 // ms
        this.backgroundColor = specs.backgroundColor
        this.antSpeedMin = specs.antSpeedMin
        this.antSpeedMax = specs.antSpeedMax
        this.specs = specs

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

        let CM
        if (this.r.prob(0)) {
            CM = ChemicalMap
        } else {
            CM = ChemicalMap3x3
        }

        // Home
        this.homeTrail = new CM({
            world: this, name: "home",
            width, height,
            color: specs.homeColor,
            evaporate: 0.995
        })
        this.home = new Home({
            world: this, width, height,
            colonyCount: specs.colonyCount,
            color: specs.homeColor
        })

        // Food
        this.foodTrail = new CM({
            world: this, name: "food",
            width, height,
            color: specs.foodColor,
            evaporate: 0.95
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

        // Ant
        this.antCount = specs.antCount
        this.antColor = specs.antColor
        this.foodColor = specs.foodColor
        this.newAntPerFrame = this.antCount / 30 / 10
        this.apc = new AntPropertyCollection({ world: this, capacity: this.antCount })
    }

    get ants() { return this.apc.ants }

    setSize({ width, height }) {
        this.width = width
        this.height = height
        this.version++
    }

    spawnMoreAnt() {
        return (this.ants.length < 100) || (
            this.ants.length < this.antCount &&
            this.ants.length * 0.1 < 3 + Math.min(this.antCount, this.storedFood)
        )
    }

    gameLoop({ profiler }) {
        let idx = 324173
        // if (this.version > 100) return
        let pf = profiler || new NullProfiler()
        this.version++

        // pre-gameLoop
        this.food.preGameLoop()

        pf.tick()
        // Create new ants
        while (this.spawnMoreAnt()) {
            this.apc.createAnt({
                position: {
                    ...this.home.randomPosition(),
                },
            })
        }

        // Game loop for ants
        this.apc.gameLoop(pf)
        pf.tick("gameLoop : ants")

        // Food and home trail
        if (this.version % 2 === 1) {
            this.foodTrail.gameLoop({
                checkIsCovered: (i) => {
                    return this.food.hasAtIdx(i)
                }
            })
            pf.tick("gameLoop : food trail")
        } else {
            this.homeTrail.gameLoop({})
            pf.tick("gameLoop : home trail")
        }

        // Home and Food
        this.home.gameLoop()
        this.food.gameLoop()
        pf.tick("gameLoop : food & home")

        // Wall
        this.wall.gameLoop()
        pf.tick("gameLoop : wall")
        pf.put("total_gameLoop", pf.elapse())

        // trigger post process
        if (typeof this.postProcessFn === "function") {
            this.postProcessFn(this)
        }
    }

    render({ profiler, step, extraTime, ctxBackground, ctxFoodTrail, ctxHomeTrail, ctxAnt, ctxFood, ctxWall }) {
        let pf = profiler || new NullProfiler()
        let tm = new Timer()

        // render background
        ctxBackground.fillStyle = this.backgroundColor
        ctxBackground.fillRect(0, 0, this.width, this.height)
        pf.tick("render : background")

        if (step % 2 === 0) {
            // render food trail
            directPixelManipulation(ctxFoodTrail, (ctx) => {
                pf.tick("render : food trail prepare")

                this.foodTrail.render(ctx)
                pf.tick("render : food trail")
            }, false, true) // do not reset and reuse bitmap
            pf.tick("render : food trail post")
        } else {
            // render home trail
            directPixelManipulation(ctxHomeTrail, (ctx) => {
                pf.tick("render : home trail prepare")

                this.homeTrail.render(ctx)
                pf.tick("render : home trail")
            }, false, true) // do not reset and reuse bitmap
            pf.tick("render : home trail post")
        }

        // render ant
        directPixelManipulation(ctxAnt, (ctxAnt) => {
            pf.tick("render : canvasAnt prepare")

            this.apc.render(ctxAnt, extraTime)
            pf.tick("render : ants")
        }, true)
        pf.tick("render : canvasAnt post")

        // render food
        directPixelManipulation(ctxFood, (ctxFood) => {
            pf.tick("render : canvasFood prepare")

            this.food.render(ctxFood)
            pf.tick("render : food")
        }, false, true)
        pf.tick("render : canvasFood post")

        // render home
        this.home.render(ctxFood)
        pf.tick("render : home")

        // render wall
        this.wall.render(ctxWall)
        pf.tick("render : wall")
        pf.put("total_render", pf.elapse())
    }
}

module.exports = World