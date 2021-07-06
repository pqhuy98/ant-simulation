const Ant = require("./Ant")
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
    requestId() { return (this.currentId++).toString() }

    constructor({ width, height, specs, rng, postProcessFn }) {
        super()
        this.currentId = 0
        this._id = this.requestId()
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
        this.ants = []
    }

    setSize({ width, height }) {
        this.width = width
        this.height = height
        this.version++
    }

    gameLoop({ profiler }) {
        let idx = 324173
        // if (this.version > 100) return
        let pf = profiler || new NullProfiler()
        let tm = new Timer()
        this.version++

        // pre-gameLoop
        this.food.preGameLoop()

        // Create new ants
        let newCnt = this.newAntPerFrame
        while (newCnt-- > 0 && this.ants.length < this.antCount) {
            this.ants.push(new Ant({
                world: this,
                position: {
                    ...this.home.randomPosition(),
                },
                color: this.antColor, foodColor: this.foodColor,
                rotation: undefined, speed: undefined,
            }))
        }

        // Game loop for ants
        this.ants.forEach(ant => {
            ant.gameLoop({ world: this, deltaT: this.deltaT })
            // Ants cannot leave screen
            ant.position.x = Math.max(0, Math.min(this.width - 1, ant.position.x))
            ant.position.y = Math.max(0, Math.min(this.height - 1, ant.position.y))
        })
        pf.put("gameLoop : ants", tm.tick())

        // Food and home trail
        if (this.version % 2 === 1) {
            this.foodTrail.gameLoop()
            pf.put("gameLoop : food trail", tm.tick())
        } else {
            this.homeTrail.gameLoop()
            pf.put("gameLoop : home trail", tm.tick())
        }

        // Home and Food
        this.home.gameLoop()
        this.food.gameLoop()
        pf.put("gameLoop : food & home", tm.tick())

        // Wall
        this.wall.gameLoop()
        pf.put("gameLoop : wall", tm.tick())

        // trigger post process
        if (typeof this.postProcessFn === "function") {
            this.postProcessFn(this)
        }
        pf.put("gameLoop : TOTAL", tm.dt0())
    }

    render({ profiler, ctxBackground, ctxFoodTrail, ctxHomeTrail, ctxAnt, ctxFood, ctxWall }) {
        let pf = profiler || new NullProfiler()
        let tm = new Timer()

        // render background
        ctxBackground.fillStyle = this.backgroundColor
        ctxBackground.fillRect(0, 0, this.width, this.height)
        pf.put("render : background", tm.tick())

        // render trail
        if (this.version % 2 === 1) { // very expensive, so we want to do it infrequently
            directPixelManipulation(ctxFoodTrail, (ctx) => {
                pf.put("render : food trail prepare", tm.tick())

                this.foodTrail.render(ctx)
                pf.put("render : food trail", tm.tick())
            }, false, true)
            pf.put("render : food trail post", tm.tick())
        } else {
            directPixelManipulation(ctxHomeTrail, (ctx) => {
                pf.put("render : home trail prepare", tm.tick())

                this.homeTrail.render(ctx)
                pf.put("render : home trail", tm.tick())
            }, false, true)
            pf.put("render : food trail post", tm.tick())
        }

        // render ant
        ctxAnt.clearRect(0, 0, this.width, this.height)
        directPixelManipulation(ctxAnt, (ctxAnt) => {
            pf.put("render : canvasAnt prepare", tm.tick())

            Ant.bulkRender(ctxAnt, this.ants)
            pf.put("render : ants", tm.tick())
        })
        pf.put("render : canvasAnt post", tm.tick())

        // render food
        directPixelManipulation(ctxFood, (ctxFood) => {
            pf.put("render : canvasFood prepare", tm.tick())

            this.food.render(ctxFood)
            pf.put("render : food", tm.tick())
        })
        pf.put("render : canvasFood post", tm.tick())

        // render home
        this.home.render(ctxFood)
        pf.put("render : home", tm.tick())

        // render wall
        this.wall.render(ctxWall)
        pf.put("render : wall", tm.tick())

        // finalize
        pf.put("render : TOTAL", tm.dt0())
    }
}

module.exports = World