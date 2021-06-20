import Ant from "./Ant"
import { v4 as uuidv4 } from "uuid"
import ChemicalMap from "./ChemicalMap"
import Food from "./Food"
import Home from "./Home"
import { randomInt } from "lib/basic_math"


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
        this.food = new Food({ width, height })
        for (let i = 0; i < foodClusters; i++) {
            this.food.put(
                Math.random() * width,
                Math.random() * height,
                randomInt(1, 3)
            )
        }

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
        this.foodTrail.render(ctx)
        this.ants.forEach(ant => ant.render(ctx))
        this.home.render(ctx)
        this.food.render(ctx)

        ctx.fillText(this.home.food, 5, this.height - 5)
    }
}