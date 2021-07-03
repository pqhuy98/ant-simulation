import { add, mul } from "../lib/basic_math"
import { getRGB } from "lib/color"
import { GameObject } from "./Random"
console.log(getRGB)

export default class Ant extends GameObject {
    constructor({ world, position, rotation, speed, color, foodColor }) {
        super(world)

        this.color = color
        this.foodColor = foodColor
        this.position = position || {
            x: this.r.random() * window.innerWidth,
            y: this.r.random() * window.innerHeight,
        }
        this.rotation = rotation || this.r.random() * 2 * Math.PI
        this.speed = speed || this.r.randomFloat(world.antSpeedMin, world.antSpeedMax)
        this.size = 1

        let diagonal = Math.sqrt(world.height * world.height + world.width * world.width) * 35
        this.rand = Math.floor(this.r.random() * diagonal / world.antSpeedMax)

        this.visionRange = 2
        this.pickupRange = 2
        this.storeRange = 3

        this.carryingFood = 0
        this.freshness = 1
        this.randomizeDecidePolicy()

        this.freshnessDecay = this.r.randomExp(0.8, 0.9)
        this.deltaT = world.deltaT
    }

    randomizeDecidePolicy() {
        this.decide = undefined
        while (!this.decide) {
            let dice = this.r.randomInt(0, 10)
            this.decide = this["decideAngle" + dice]
        }
    }

    static bulkRender(ctx, ants) {
        let width = ctx.canvas.width
        var bitmap = ctx.bitmap
        const colorCache = {}

        for (let i = 0; i < ants.length; i++) {
            let color = ants[i].isCarryingFood() ? ants[i].color : ants[i].foodColor
            let colorArr = colorCache[color] || (colorCache[color] = getRGB(color))

            let { x, y } = ants[i].position
            x = Math.floor(x)
            y = Math.floor(y)
            let offset = (x + y * width) * 4

            bitmap[offset] = colorArr[0]
            bitmap[offset + 1] = colorArr[1]
            bitmap[offset + 2] = colorArr[2]
            bitmap[offset + 3] = colorArr[3]
        }
    }

    gameLoop() {
        this.think()
        this.releaseChemicals()
        this.move()
    }

    think() {
        let world = this.world
        if (this.position.x === 0 || this.position.x === world.width - 1) {
            this.rotation = Math.PI - this.rotation
        }
        if (this.position.y === 0 || this.position.y === world.height - 1) {
            this.rotation = 2 * Math.PI - this.rotation
        }

        if ((this.rand + world.version) % 2 > 0) {
            let trail, dest
            if (this.isCarryingFood()) {
                trail = world.homeTrail
                dest = world.home
            } else {
                trail = world.foodTrail
                dest = world.food
            }
            this.rotation = this.findWay({ trail, dest })
        } else {
            this.rotation += this.r.randomFloat(-0.08, 0.08)
        }
        this.rotation %= 2 * Math.PI
    }

    findWay({ trail, dest }) {
        let vision = this.visionRange

        // Sample 3 areas ahead: straight, left right
        let { x, y } = this.position

        // sampled lines of sight
        let deviant = this.r.randomFloat(Math.PI / 4, Math.PI / 3)
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
            x + Math.cos(deg) * vision * 2,
            y + Math.sin(deg) * vision * 2,
            vision
        ))

        return this.decide(degs, vals)
    }

    move() {
        let world = this.world
        let deltaT = this.deltaT
        // move forward
        let oldPos = this.position
        this.position = add(
            this.position,
            mul(
                { x: Math.cos(this.rotation), y: Math.sin(this.rotation) },
                this.speed * deltaT
            )
        )
        if (!this.world.wall.allowPoint(this.position)) {
            // revert the move
            this.position = oldPos
            this.rotation += this.r.randomFloat(-Math.PI / 2, Math.PI / 2)
        }

        if (!this.isCarryingFood()) {
            // search for very close food
            let foodPos = world.food.has(this.position.x, this.position.y, this.pickupRange)
            if (foodPos) {
                world.food.take(foodPos[0], foodPos[1], 1)
                this.world.pickedFood++
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
                this.world.pickedFood -= this.carryingFood
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

    releaseChemicals() {
        let world = this.world
        let { x, y } = this.position
        let trail
        if (this.isCarryingFood()) {
            trail = world.foodTrail
        } else {
            trail = world.homeTrail
        }
        trail.put(x, y, 1 * this.freshness)
        if (!this.isCarryingFood()) {
            world.foodTrail.clean(x, y, 0.85)
        }
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

    _decideAngle2(degs, vals) {
        let total = 0
        vals.forEach(v => total += v)
        let dice = this.r.randomFloat(0, total)
        let sum = 0
        for (let i = 1; i < degs.length; i++) {
            if (sum > dice) {
                return degs[i - 1]
            }
            sum += vals[i]
        }
        return degs[degs.length - 1]
    }

    _decideAngle3(degs, vals) {
        return this._decideAngle2(degs, vals.map(v => v * v))
    }

    decideAngle4(degs, vals) {
        return this.decideAngle0(degs, vals.map(v => v * v))
    }
}