import Ant from "./Ant"
import { v4 as uuidv4 } from "uuid"
import ChemicalMap from "./ChemicalMap"
import Food from "./Food"
import Home from "./Home"
import {
    // MODE_FOOD,
    t
} from "config/Themes"
import { randomInt } from "../lib/basic_math"
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

        // Home
        this.homeTrail = new ChemicalMap({ width, height, color: t().homeColor })
        this.home = new Home({ width, height, colonyCount, world: this })

        // Food
        this.foodTrail = new ChemicalMap({ width, height, color: t().foodColor })
        this.food = new Food({ width, height, foodClusters, world: this })


        this.ants = [...Array(antCount)].map(() => new Ant({
            position: {
                ...this.home.locations[randomInt(0, colonyCount)],
            },
            world: this,
        }))

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
        let tm = new Timer()
        this.ants.forEach(ant => {
            ant.gameLoop({ world: this, deltaT })
            // Ants cannot leave screen
            ant.position.x = Math.max(0, Math.min(this.width - 1, ant.position.x))
            ant.position.y = Math.max(0, Math.min(this.height - 1, ant.position.y))
        })
        this.pf.put("gameLoop : ants", tm.tick())
        this.foodTrail.process()
        this.pf.put("gameLoop : food trail", tm.tick())
        this.homeTrail.process()
        this.pf.put("gameLoop : home trail", tm.tick())

        this.version++
        if (typeof this.postProcessFn === "function") {
            this.postProcessFn(this)
        }
        this.pf.put("gameLoop : TOTAL", tm.dt0())
        this.pf.put("TOTAL", this.pf.get("gameLoop : TOTAL") + this.pf.get("render : TOTAL"))
        this.pf.print()
    }

    render({ ctx, ctxAnt, ctxFood }) {
        this.pf.reset()
        let tm = new Timer()

        // render background and trail
        if (this.version % 2 === 0) { // very expensive, so we want to do it infrequently
            ctx.fillStyle = t().backgroundColor
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            this.pf.put("render : background", tm.tick())

            // render all objects
            directPixelManipulation(ctx, (ctx) => {
                this.pf.put("render : canvas1 prepare", tm.tick())

                this.foodTrail.render(ctx)
                this.pf.put("render : food trail", tm.tick())

                this.homeTrail.render(ctx)
                this.pf.put("render : home trail", tm.tick())
            })
            this.pf.put("render : canvas1 post", tm.tick())
        }

        // render ant
        ctxAnt.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
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
    }
}
