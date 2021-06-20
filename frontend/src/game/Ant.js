import config from "../config"
import { add, mul, randomFloat } from "lib/basic_math"
import { v4 as uuidv4 } from "uuid"

export default class Ant {
    constructor(props) {
        const { position, rotation, speed } = props || {}

        this.id = uuidv4()
        this.position = position || {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
        }
        this.rotation = rotation || Math.random() * 2 * Math.PI
        this.speed = speed || randomFloat(config.ANT_SPEED_MIN, config.ANT_SPEED_MAX)
        this.size = 1
        this.rand = Math.floor(Math.random() * 100)

        this.visionRange = 10
        this.pickupRange = 2
        this.storeRange = 2

        this.carryingFood = 0
        this.freshness = 1
    }

    render(ctx) {
        ctx.beginPath()
        if (this.isCarryingFood()) {
            ctx.fillStyle = "#aa4800"
        } else {
            ctx.fillStyle = "black"
        }
        ctx.fillRect(this.position.x, this.position.y, 1, 1)
        ctx.stroke()
    }

    gameLoop({ world, deltaT }) {
        this.think({ world })
        this.releaseChemicals({ world })
        this.move({ world, deltaT })
    }

    think({ world }) {
        if (this.position.x === 0 || this.position.x === world.width - 1) {
            this.rotation = Math.PI - this.rotation
        }
        if (this.position.y === 0 || this.position.y === world.height - 1) {
            this.rotation = 2 * Math.PI - this.rotation
        }

        if ((this.rand + world.version) % 4 > 0) {
            if (this.isCarryingFood()) {
                this.findWay({ trail: world.homeTrail, map: world.homeMap })
            } else {
                this.findWay({ trail: world.foodTrail, map: world.foodMap })
            }
        } else {
            this.rotation += randomFloat(-0.05, 0.05)
        }
        this.rotation %= 2 * Math.PI
    }

    findWay({ trail, map }) {
        let vision = this.visionRange

        // Sample 3 areas ahead: left, straight, right
        let { x, y } = this.position
        let rot = this.rotation

        // sampled lines of sight
        let deviant = randomFloat(Math.PI / 6, Math.PI / 4)

        let degs = [rot + deviant, rot, rot - deviant]

        // find destination within vision
        for (let i = 0; i < degs.length; i++) {
            let pos = map.has(
                x + Math.cos(degs[i]) * vision * 1.1,
                y + Math.sin(degs[i]) * vision * 1.1,
                vision
            )
            if (pos) {
                this.rotation = Math.atan2(pos[1] - y, pos[0] - x)
                return
            }
        }

        // No destination saw, use trail
        let angle = 0, total = 0
        for (let i = 0; i < degs.length; i++) {
            let val = trail.sum({
                xc: x + Math.cos(degs[i]) * vision * 1.1,
                yc: y + Math.sin(degs[i]) * vision * 1.1,
                sz: vision
            })
            val *= val
            // val = Math.exp(val)
            angle += val * degs[i]
            total += val
        }
        angle /= total

        this.rotation = angle * randomFloat(0.85, 1 / 0.85)
    }

    move({ world, deltaT }) {
        // move forward
        this.position = add(
            this.position,
            mul(
                { x: Math.cos(this.rotation), y: Math.sin(this.rotation) },
                this.speed * deltaT
            )
        )
        this.freshness *= 0.999

        if (!this.isCarryingFood()) {
            // search for very close food
            let foodPos = world.foodMap.has(this.position.x, this.position.y, this.pickupRange)
            if (foodPos) {
                this.carryingFood += 1
                this.freshness = 1
                world.foodMap.take(foodPos[0], foodPos[1], 1)
                this.rotation *= -1
            }
        } else {
            let homePos = world.homeMap.has(this.position.x, this.position.y, this.storeRange)
            if (homePos) {
                world.homeMap.give(this.carryingFood)
                this.carryingFood = 0
                this.freshness = 1
                this.rotation *= -1
            }
        }
    }

    isCarryingFood() {
        return this.carryingFood > 0
    }

    releaseChemicals({ world }) {
        if (this.isCarryingFood()) {
            world.foodTrail.put(this.position.x, this.position.y, this.freshness)
        } else {
            world.homeTrail.put(this.position.x, this.position.y, this.freshness)
        }
    }
}