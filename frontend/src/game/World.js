import Ant from "./Ant"
import { v4 as uuidv4 } from "uuid"
import ChemicalMap from "./ChemicalMap"
import FoodMap from "./FoodMap"
import HomeMap from "./HomeMap"
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
        this.homeMap = new HomeMap({ width, height, colonyCount })

        // Food
        this.foodTrail = new ChemicalMap({ width, height })
        this.foodMap = new FoodMap({ width, height })
        for (let i = 0; i < foodClusters; i++) {
            this.foodMap.put(
                Math.random() * (width - 10),
                Math.random() * (height - 10),
                10
            )
        }

        this.ants = [...Array(antCount)].map(() => new Ant({
            position: {
                ...this.homeMap.locations[randomInt(0, colonyCount)],
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
        this.homeTrail.render(ctx)

        this.ants.forEach(ant => ant.render(ctx))


        this.homeMap.render(ctx)
        this.foodMap.render(ctx)

        ctx.fillText(this.homeMap.food, 5, this.height - 5)
    }
}