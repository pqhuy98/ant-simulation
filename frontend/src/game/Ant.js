import { v4 as uuidv4 } from "uuid"
import { t } from "../config/Themes"
import config from "../config"
import { add, mul, randomExp, randomFloat, randomInt } from "../lib/basic_math"
import { getRGB } from "lib/color"

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

        this.visionRange = 8
        this.pickupRange = 2
        this.storeRange = 2

        this.carryingFood = 0
        this.freshness = 1
        let dice = randomInt(0, 4 + 1)
        this.decide = this["decideAngle" + dice]

        this.freshnessDecay = randomExp(0.6, 0.7)
    }

    static bulkRender(ctx, ants) {
        let freeColor = getRGB(t().antColor0)
        let carryColor = getRGB(t().antColor1)
        let width = ctx.canvas.width

        var bitmap = ctx.bitmap
        for (let i = 0; i < ants.length; i++) {
            let { x, y } = ants[i].position
            x = Math.floor(x)
            y = Math.floor(y)
            let offset = (x + y * width) * 4
            bitmap.set(ants[i].isCarryingFood() ? carryColor : freeColor, offset)
        }
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

        if ((this.rand + world.version) % 3 > 0) {
            let trail, dest
            if (this.isCarryingFood() || this.freshness < 1e-60) {
                trail = world.homeTrail
                dest = world.home
            } else {
                trail = world.foodTrail
                dest = world.food
            }
            this.rotation = this.findWay({ trail, dest })
        } else {
            this.rotation += randomFloat(-0.05, 0.05)
        }
        this.rotation %= 2 * Math.PI
    }

    findWay({ trail, dest }) {
        let vision = this.visionRange

        // Sample 3 areas ahead: straight, left right
        let { x, y } = this.position
        // sampled lines of sight
        let deviant = randomFloat(Math.PI / 4, Math.PI / 3)
        let degs = [
            this.rotation, this.rotation + deviant, this.rotation - deviant,
        ]

        // find destination within vision
        for (let i = 0; i < degs.length; i++) {
            let pos = dest.has(
                x + Math.cos(degs[i]) * vision,
                y + Math.sin(degs[i]) * vision,
                vision
            )
            if (pos) {
                return Math.atan2(pos[1] - y, pos[0] - x)
            }
        }

        // No destination saw, use trail
        let vals = degs.map(deg => trail.sum(
            x + Math.cos(deg) * vision,
            y + Math.sin(deg) * vision,
            vision
        ))

        return this.decide(degs, vals)
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
        if (!this.isCarryingFood()) {
            // search for very close food
            let foodPos = world.food.has(this.position.x, this.position.y, this.pickupRange)
            if (foodPos) {
                world.food.take(foodPos[0], foodPos[1], 1)
                this.carryingFood += 1
                this.rotation *= -1
                this.freshness = 1
            }
            // near home, refresh itself
            let homePos = world.home.has(this.position.x, this.position.y, this.visionRange / 2)
            if (homePos) {
                this.freshness = 1
            }
        } else {
            let homePos = world.home.has(this.position.x, this.position.y, this.storeRange)
            if (homePos) {
                world.home.give(this.carryingFood)
                this.carryingFood = 0
                this.rotation *= -1
                this.freshness = 1
            }
            // near food, refresh itself
            let foodPos = world.food.has(this.position.x, this.position.y, this.visionRange * 2)
            if (foodPos) {
                this.freshness = 1
            }

        }
    }

    isCarryingFood() {
        return this.carryingFood > 0
    }

    releaseChemicals({ world }) {
        let { x, y } = this.position
        let trail
        if (this.isCarryingFood()) {
            trail = world.foodTrail
        } else {
            trail = world.homeTrail
        }
        // let val = trail.get(x, y)
        // let wantedVal = Math.min(300, val + this.freshness * 100)
        // trail.put(x, y, Math.max(0, wantedVal - val))
        trail.put(x, y, 1 * this.freshness)
        this.freshness *= this.freshnessDecay
    }

    /*
        mutations
    */
    decideAngle0(degs, vals) {
        let angle = 0, total = 0
        for (let i = 0; i < degs.length; i++) {
            let val = vals[i], deg = degs[i]
            angle += val * deg
            total += val
        }
        return (total != 0 ? angle / total : degs[0])
    }

    decideAngle1(degs, vals) {
        let angle = degs[0], maxVal = vals[0]
        for (let i = 0; i < degs.length; i++) {
            if (vals[i] > maxVal) {
                angle = degs[i]
            }
        }
        return angle
    }

    decideAngle2(degs, vals) {
        let total = 0
        vals.forEach(v => total += v)
        let dice = randomFloat(0, total)
        let sum = 0
        for (let i = 1; i < degs.length; i++) {
            if (sum > dice) {
                return degs[i - 1]
            }
            sum += vals[i]
        }
        return degs[degs.length - 1]
    }

    decideAngle3(degs, vals) {
        return this.decideAngle2(degs, vals.map(v => v * v))
    }

    decideAngle4(degs, vals) {
        return this.decideAngle0(degs, vals.map(v => v * v))
    }
}