import Ant from "./Ant"
import { v4 as uuidv4 } from "uuid"
import ChemicalMap from "./ChemicalMap"
import Food from "./Food"
import Home from "./Home"
import {
    // MODE_FOOD,
    t
} from "config/Themes"
import { directPixelManipulation } from "lib/canvas_optimizer"
import { Profiler, Timer } from "lib/performance"
export default class World {
    static collection = new Map()

    constructor({ width, height, antCount, colonyCount, foodClusters, postProcessFn }) {
        this.id = uuidv4()
        this.width = width
        this.height = height
        this.version = 0
        this.pickedFood = 0
        this.unpickedFood = 0
        this.storedFood = 0
        this.postProcessFn = postProcessFn
        this.pf = new Profiler()
        this.deltaT = 1 / 30 // ms

        // Home
        this.homeTrail = new ChemicalMap({ name: "home", width, height, color: t().homeColor, evaporate: 0.995 })
        this.home = new Home({ width, height, colonyCount, world: this })

        // Food
        this.foodTrail = new ChemicalMap({ name: "food", width, height, color: t().foodColor, evaporate: 0.95 })
        this.food = new Food({ width, height, foodClusters, world: this })

        this.antCount = antCount
        this.newAntPerFrame = this.antCount / 30 / 10
        this.ants = []

        World.collection.set(this.id, this)
    }

    static get(id) {
        return World.collection.get(id)
    }

    setSize({ width, height }) {
        this.width = width
        this.height = height
        this.version++
    }

    gameLoop({ deltaT }) {
        this.pf.reset()
        this.version++
        let tm = new Timer()

        // Create new ants
        let newCnt = this.newAntPerFrame
        while (newCnt-- > 0 && this.ants.length < this.antCount) {
            this.ants.push(new Ant({
                position: {
                    ...this.home.randomPosition(),
                },
                world: this,
            }))
        }

        // Game lop for ants
        this.ants.forEach(ant => {
            ant.gameLoop({ world: this, deltaT })
            // Ants cannot leave screen
            ant.position.x = Math.max(0, Math.min(this.width - 1, ant.position.x))
            ant.position.y = Math.max(0, Math.min(this.height - 1, ant.position.y))
        })
        this.pf.put("gameLoop : ants", tm.tick())

        // Food and home trail
        if (this.version % 2 === 1) {
            this.foodTrail.gameLoop()
            this.pf.put("gameLoop : food trail", tm.tick())
        } else {
            this.homeTrail.gameLoop()
            this.pf.put("gameLoop : home trail", tm.tick())
        }

        // Home and Food
        this.home.gameLoop()
        this.food.gameLoop()

        // trigger post process
        if (typeof this.postProcessFn === "function") {
            this.postProcessFn(this)
        }
        this.pf.put("gameLoop : TOTAL", tm.dt0())
    }

    render({ ctxBackground, ctxFoodTrail, ctxHomeTrail, ctxAnt, ctxFood }) {
        let tm = new Timer()

        // render background
        ctxBackground.fillStyle = t().backgroundColor
        ctxBackground.fillRect(0, 0, this.width, this.height)
        this.pf.put("render : background", tm.tick())

        // render trail
        if (this.version % 2 === 0) { // very expensive, so we want to do it infrequently
            directPixelManipulation(ctxFoodTrail, (ctx) => {
                this.pf.put("render : food trail prepare", tm.tick())

                this.foodTrail.render(ctx)
                this.pf.put("render : food trail", tm.tick())
            }, false, true)
            this.pf.put("render : food trail post", tm.tick())
            directPixelManipulation(ctxHomeTrail, (ctx) => {
                this.pf.put("render : home trail prepare", tm.tick())

                this.homeTrail.render(ctx)
                this.pf.put("render : home trail", tm.tick())
            }, false, true)
            this.pf.put("render : food trail post", tm.tick())
        }

        // render ant
        ctxAnt.clearRect(0, 0, this.width, this.height)
        directPixelManipulation(ctxAnt, (ctxAnt) => {
            this.pf.put("render : canvasAnt prepare", tm.tick())

            Ant.bulkRender(ctxAnt, this.ants)
            this.pf.put("render : ants", tm.tick())
        })
        this.pf.put("render : canvasAnt post", tm.tick())

        // render food
        directPixelManipulation(ctxFood, (ctxFood) => {
            this.pf.put("render : canvasFood prepare", tm.tick())

            this.food.render(ctxFood)
            this.pf.put("render : food", tm.tick())
        })
        this.pf.put("render : canvasFood post", tm.tick())

        this.home.render(ctxFood)
        this.pf.put("render : home", tm.tick())

        this.pf.put("render : TOTAL", tm.dt0())

        this.pf.put("TOTAL", this.pf.get("gameLoop : TOTAL") + this.pf.get("render : TOTAL"))
        this.pf.print()
    }
}
