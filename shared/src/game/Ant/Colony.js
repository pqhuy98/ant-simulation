const PropertyCollection = require("./PropertyCollection")
const ChemicalMap3x3 = require("../ChemicalMap/ChemicalMap_3x3")
const Home = require("../Home")
const { GameObject } = require("../GameObject")
const { directPixelManipulation } = require("../../lib/canvas_optimizer")
const { NullProfiler } = require("../../lib/performance")

module.exports = class Colony extends GameObject {
    constructor({ world, capacity, color }) {
        super(world)
        this.pc = new PropertyCollection({ world, colony: this, capacity })
        this.home = new Home({
            world, colony: this,
            width: world.width, height: world.height,
            color, entranceCount: 1
        })
        this.homeTrail = new ChemicalMap3x3({
            world, name: "home",
            width: world.width, height: world.height,
            color, evaporate: 0.995,
        })
        this.color = color
        this.capacity = capacity
        this.storedFood = 0
        this.pickedFood = 0
    }

    get ants() { return this.pc.ants }

    canSpawnMoreAnts() {
        return (this.ants.length < 100) || (
            this.ants.length < this.capacity &&
            this.ants.length * 0.1 < this.storedFood
        )
    }

    spawnAntsIfPossible() {
        while (this.canSpawnMoreAnts()) {
            this.pc.createAnt({
                position: {
                    ...this.home.randomPosition(),
                },
            })
        }
    }

    gameLoop(profiler) {
        this.spawnAntsIfPossible()

        this.home.gameLoop()
        this.homeTrail.gameLoop({})

        profiler.tick("gameLoop : home trail")
        this.pc.gameLoop(profiler)
    }

    render({ profiler, extraTime, ctxAnt, ctxHomeTrail, ctxHome }) {
        profiler = profiler || new NullProfiler()
        // render ants
        ctxAnt.clearRea
        directPixelManipulation(ctxAnt, (ctxAnt) => {
            profiler.tick("render : canvasAnt prepare")

            this.pc.render({ ctx: ctxAnt, extraTime })
            profiler.tick("render : ants")
        }, false, true)
        profiler.tick("render : canvasAnt post")

        // render home trail
        if (!ctxHomeTrail) return
        directPixelManipulation(ctxHomeTrail, (ctx) => {
            profiler.tick("render : home trail prepare")

            this.homeTrail.render(ctx)
            profiler.tick("render : home trail")
        }, false, true) // do not reset and reuse bitmap
        profiler.tick("render : home trail post")

        // render home
        this.home.render(ctxHome)
        profiler.tick("render : home")
    }
}