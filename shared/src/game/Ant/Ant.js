const { add, mul } = require("../../lib/basic_math")
const { getRGB } = require("../../lib/color")
const { GameObject } = require("../GameObject")

module.exports = class Ant extends GameObject {
    constructor({ propertyCollection, world, position, rotation, speed }) {
        super(world)
        this.pc = propertyCollection
        this.pcId = this.pc.registerId()

        this.position = position
        this.rotation = rotation || this.r.random() * 2 * Math.PI

        this.speed = speed || this.r.randomFloat(world.antSpeedMin, world.antSpeedMax)

        this.carryingFood = 0

        this.freshness = 1
        this.freshnessDecay = this.r.randomExp(0.8, 0.9)

        this.decideIdx = undefined
        this.randomizeDecidePolicy()
    }

    // individual properties
    get position() { return this.pc.getPosition(this.pcId) }
    set position(pos) { return this.pc.setPosition(this.pcId, pos) }

    get rotation() { return this.pc.getRotation(this.pcId) }
    set rotation(rot) { return this.pc.setRotation(this.pcId, rot) }

    get speed() { return this.pc.getSpeed(this.pcId) }
    set speed(speed) { return this.pc.setSpeed(this.pcId, speed) }

    get carryingFood() { return this.pc.getCarryingFood(this.pcId) }
    set carryingFood(carryingFood) { return this.pc.setCarryingFood(this.pcId, carryingFood) }

    get freshness() { return this.pc.getFreshness(this.pcId) }
    set freshness(freshness) { return this.pc.setFreshness(this.pcId, freshness) }


    get freshnessDecay() { return this.pc.getFreshnessDecay(this.pcId) }
    set freshnessDecay(freshnessDecay) { return this.pc.setFreshnessDecay(this.pcId, freshnessDecay) }

    get decideIdx() { return this.pc.getDecideIdx(this.pcId) }
    set decideIdx(decideIdx) { return this.pc.setDecideIdx(this.pcId, decideIdx) }

    // static properties
    get color() { return this.world.antColor }
    get foodColor() { return this.world.foodColor }
    get size() { return 1 }
    get visionRange() { return 2 }
    get pickupRange() { return 2 }
    get storeRange() { return 3 }

    randomizeDecidePolicy() {
        this.decideIdx = undefined
        while (!this["decideAngle" + this.decideIdx]) {
            this.decideIdx = this.r.randomInt(0, 10)
        }
    }

    static bulkRender(ctx, ants) {
        let width = ctx.canvas.width
        var bitmap = ctx.bitmap
        const colorCache = {}

        for (let i = 0; i < ants.length; i++) {
            let color = ants[i].isCarryingFood() ? ants[i].foodColor : ants[i].color
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
        let { x, y } = this.position
        if (x === 0 || x === world.width - 1) {
            this.rotation = Math.PI - this.rotation
        }
        if (y === 0 || y === world.height - 1) {
            this.rotation = 2 * Math.PI - this.rotation
        }

        if (this.r.prob(0.5)) {
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
            this.rotation = this.rotation + this.r.randomFloat(-0.08, 0.08)
        }

        this.rotation = this.rotation % (2 * Math.PI)
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
            vision,
            this._id
        ))

        return this.decide(degs, vals)
    }

    move() {
        let world = this.world
        let deltaT = this.world.deltaT
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
            this.rotation = this.rotation + this.r.randomFloat(-Math.PI / 2, Math.PI / 2)
        }

        if (!this.isCarryingFood()) {
            // search for very close food
            let foodPos = world.food.has(this.position.x, this.position.y, this.pickupRange)
            if (foodPos) {
                world.food.take(foodPos[0], foodPos[1], 1)
                this.world.pickedFood++
                this.carryingFood = this.carryingFood + 1
                this.rotation = -this.rotation
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
                this.rotation = -this.rotation
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
        if (this.isCarryingFood()) {
            world.foodTrail.put(x, y, 1 * this.freshness)
            world.homeTrail.clean(x, y, 0.95)
        } else {
            world.homeTrail.put(x, y, 1 * this.freshness)
            world.foodTrail.clean(x, y, 0.85)
        }
        this.freshness = this.freshness * this.freshnessDecay
    }

    /*
        mutations
    */

    decide(degs, vals) {
        return this["decideAngle" + this.decideIdx](degs, vals)
    }

    // Choose angle that has the maximum `vals`
    decideAngle1(degs, vals) {
        let angle = degs[0], maxVal = vals[0]
        for (let i = 0; i < degs.length; i++) {
            if (vals[i] > maxVal) {
                angle = degs[i]
            }
        }
        return angle
    }


    // Choose the average of angles weighted by `vals` 
    decideAngle2(degs, vals) {
        let angle = 0, total = 0
        for (let i = 0; i < degs.length; i++) {
            let val = vals[i], deg = degs[i]
            angle += val * deg
            total += val
        }
        return (total != 0 ? angle / total : degs[0])
    }

    // Choose the average of angles weighted by `vals ^ 2` 
    decideAngle3(degs, vals) {
        return this.decideAngle2(degs, vals.map(v => v * v))
    }
}