import Ant from "./Ant"
import { v4 as uuidv4 } from "uuid"
import ChemicalMap from "./ChemicalMap"
import Food from "./Food"
import Home from "./Home"
import {
    MODE_FOOD,
    t
} from "config/Themes"
import { randomInt } from "../lib/basic_math"
import { directPixelManipulation } from "lib/canvas_optimizer"
export default class World {
    static collection = new Map()

    constructor({ width, height, antCount, colonyCount, foodClusters }) {
        this.id = uuidv4()
        this.width = width
        this.height = height
        this.version = 0

        // Home
        this.homeTrail = new ChemicalMap({ width, height })
        this.home = new Home({ width, height, colonyCount })

        // Food
        this.foodTrail = new ChemicalMap({ width, height })
        this.food = new Food({ width, height, foodClusters })


        this.ants = [...Array(antCount)].map(() => new Ant({
            position: {
                ...this.home.locations[randomInt(0, colonyCount)],
            }
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
        this.ants.forEach(ant => {
            ant.gameLoop({ world: this, deltaT })
            // Ants cannot leave screen
            ant.position.x = Math.max(0, Math.min(this.width - 1, ant.position.x))
            ant.position.y = Math.max(0, Math.min(this.height - 1, ant.position.y))
        })
        this.foodTrail.process({ version: this.version })
        this.homeTrail.process({ version: this.version })

        this.version++
    }

    render(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // render all objects
        directPixelManipulation(ctx, (ctx) => {
            if (t().chemicalRenderMode === MODE_FOOD) {
                this.foodTrail.render(ctx)
            } else {
                this.homeTrail.render(ctx)
            }
            Ant.bulkRender(ctx, this.ants)
            this.food.render(ctx)
        })
        this.home.render(ctx)
    }
}
