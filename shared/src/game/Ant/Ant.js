const { add, mul, sinApprox, cosApprox } = require("../../lib/basic_math")
const { getRGB } = require("../../lib/color")
const { GameObject } = require("../GameObject")

module.exports = class Ant extends GameObject {
    /**
     * @param {World} world world object this ant lives in. 
     * @param {PropertyCollection} pc object to store ants properties (attributes).
     */
    constructor({ world, pc, position, rotation, speed }) {
        super(world)
        this.pc = pc
        this.pcId = this.pc.registerId(this._id)

        this.position = position
        this.rotation = rotation || this.r.random() * 2 * Math.PI

        this.speed = speed || this.r.randomFloat(world.antSpeedMin, world.antSpeedMax)

        this.carryingFood = 0

        this.freshness = 1
        this.freshnessDecay = this.r.randomExp(0.8, 0.85)

        this.randomizeDecidePolicy()
    }

    static reviveAnt({ _id, r, pc, pcId, }) {
        let res = Ant.createNull()
        res._id = _id
        res.r = r
        res.pc = pc
        res.pcId = pcId
        return res
    }

    // individual properties
    get world() { return this.pc.world }
    get colony() { return this.pc.colony }
    get home() { return this.colony.home }
    get food() { return this.world.food }

    get homeTrail() { return this.colony.homeTrail }
    get foodTrail() { return this.world.foodTrail }

    get position() { return this.pc.getPosition(this.pcId) }
    set position(pos) { return this.pc.setPosition(this.pcId, pos) }

    get rotation() { return this.pc.getRotation(this.pcId) }
    set rotation(rot) { return this.pc.setRotation(this.pcId, rot) }
    get rotationCos() { return this.pc.getRotationCos(this.pcId) }
    set rotationCos(cos) { return this.pc.setRotationCos(this.pcId, cos) }
    get rotationSin() { return this.pc.getRotationSin(this.pcId) }
    set rotationSin(sin) { return this.pc.setRotationSin(this.pcId, sin) }

    get speed() { return this.pc.getSpeed(this.pcId) }
    set speed(speed) { return this.pc.setSpeed(this.pcId, speed) }

    get carryingFood() { return this.pc.getCarryingFood(this.pcId) }
    set carryingFood(carryingFood) { return this.pc.setCarryingFood(this.pcId, carryingFood) }

    get freshness() { return this.pc.getFreshness(this.pcId) }
    set freshness(freshness) { return this.pc.setFreshness(this.pcId, freshness) }


    get freshnessDecay() { return this.pc.getFreshnessDecay(this.pcId) }
    set freshnessDecay(freshnessDecay) { return this.pc.setFreshnessDecay(this.pcId, freshnessDecay) }

    get decideIdx() { return this.pc.getDecideIdx(this.pcId) }
    set decideIdx(decideIdx) {
        return this.pc.setDecideIdx(this.pcId, decideIdx)
    }

    // static properties
    get color() { return this.colony.color }
    get foodColor() { return this.world.foodColor }

    get visionRange() { return 2 * this.world.trailScale }

    get pickupRange() { return 2 }
    get storeRange() { return this.colony.home.size }

    get foodDetectionRange() { return this.visionRange }
    get homeDetectionRange() { return this.visionRange * 2 }

    randomizeDecidePolicy() {
        this.decideIdx = 11
        while (!this["decideAngle" + this.decideIdx]) {
            this.decideIdx = this.r.randomInt(0, 10)
        }
    }

    gameLoop(profiler) {
        // profiler.tick()
        this.move()
        // profiler.tick("ant.move")
        this.think()
        // profiler.tick("ant.think")
        this.releaseChemicals()
        // profiler.tick("ant.releaseChemical")
        this.rotationCos = cosApprox(this.rotation)
        this.rotationSin = sinApprox(this.rotation)
        // profiler.tick("ant.rotationSinCos")
    }

    think() {
        if (this.r.prob(0.9)) {
            let trail, dest
            if (this.isCarryingFood()) {
                trail = this.homeTrail
                dest = this.home
            } else {
                trail = this.foodTrail
                dest = this.food
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
        // let deviant = 2 * Math.PI / 3
        let deviant = this.r.randomFloat(Math.PI / 3, Math.PI / 4)
        let degs = [
            this.rotation, this.rotation + deviant, this.rotation - deviant,
        ]
        let degCos = degs.map(d => cosApprox(d))
        let degSin = degs.map(d => sinApprox(d))
        // find destination within vision
        let pos = dest.has(
            x, y,
            (dest === this.home ? this.homeDetectionRange : this.foodDetectionRange)
        )
        if (pos) {
            return Math.atan2(pos.y - y, pos.x - x)
        }

        // No destination saw, use trail
        let vals = degs.map((_, i) => trail.sum(
            x + degCos[i] * vision,
            y + degSin[i] * vision,
            vision,
        ))

        return this.decide(degs, vals)
    }

    move() {
        let deltaT = this.world.deltaT
        // move forward
        let oldPos = this.position
        let { x, y } = this.position
        this.position = {
            x: x + this.rotationCos * this.speed * deltaT,
            y: y + this.rotationSin * this.speed * deltaT
        }

        x = ~~this.position.x
        y = ~~this.position.y
        let revert = false
        if (x <= 0 || x >= this.world.width - 1) {
            this.rotation = Math.PI - this.rotation
            revert = true
        }
        if (y <= 0 || y >= this.world.height - 1) {
            this.rotation = 2 * Math.PI - this.rotation
            revert = true
        }
        if (!this.world.wall.allowPoint(this.position) || revert) {
            // revert the move
            this.position = oldPos
            if (!revert) {
                this.rotation = -this.rotation + this.r.randomFloat(-Math.PI / 2, Math.PI / 2)
            }
            return
        }

        if (!this.isCarryingFood()) {
            // search for very close food
            let foodPos = this.food.has(this.position.x, this.position.y, this.pickupRange)
            if (foodPos) {
                this.food.take(foodPos.x, foodPos.y, 1)
                this.colony.pickedFood++
                this.carryingFood = this.carryingFood + 1
                this.rotation = -this.rotation
                this.freshness = 1
            }
        } else {
            let homePos = this.home.has(this.position.x, this.position.y, this.storeRange)
            if (homePos) {
                this.home.give(this.carryingFood)
                this.colony.pickedFood -= this.carryingFood
                this.carryingFood = 0
                this.rotation = -this.rotation
                this.freshness = 1
            }
        }
    }

    isCarryingFood() {
        return this.carryingFood > 0
    }

    releaseChemicals() {
        let { x, y } = this.position
        if (this.isCarryingFood()) {
            this.foodTrail.put(x, y, 1 * this.freshness)
            this.homeTrail.clean(x, y, 0.995)
        } else {
            this.homeTrail.put(x, y, 1 * this.freshness)
            this.foodTrail.clean(x, y, 0.96)
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