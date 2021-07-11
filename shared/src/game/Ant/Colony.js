const PropertyCollection = require("./PropertyCollection")
const ChemicalMap3x3 = require("../ChemicalMap/ChemicalMap_3x3")
const Home = require("../Home")
const { GameObject } = require("../GameObject")
const { directPixelManipulation } = require("../../lib/canvas_optimizer")
const { NullProfiler } = require("../../lib/performance")

module.exports = class Colony extends GameObject {
    constructor({ world, capacity, antColor, homeColor, homeCount }) {
        capacity = Math.round(capacity)
        super(world)
        this.pc = new PropertyCollection({ world, colony: this, capacity })
        this.home = new Home({
            world, colony: this,
            width: world.width, height: world.height,
            color: homeColor, homeCount: homeCount
        })
        this.homeTrail = new ChemicalMap3x3({
            world, name: "home",
            width: world.width, height: world.height,
            color: homeColor, evaporate: 0.995,
        })
        this.color = antColor
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
        profiler.tick("gameLoop::colonies.spawnAntsIfPossible")

        this.home.gameLoop()
        profiler.tick("gameLoop::colonies.home")

        this.homeTrail.gameLoop({})
        profiler.tick("gameLoop::colonies.homeTrail")

        this.pc.gameLoop(profiler)
        profiler.tick("gameLoop::colonies.pc")
    }

    render({ profiler, extraTime, ctxAnt, ctxHomeTrail, ctxHome }) {
        profiler = profiler || new NullProfiler()
        // render ants
        this.pc.render({ profiler, ctx: ctxAnt, extraTime })
        profiler.tick("render : ants")

        // render home trail
        this.homeTrail.render({ profiler, ctx: ctxHomeTrail })

        // render home
        this.home.render(ctxHome)
        profiler.tick("render : home")
    }
}