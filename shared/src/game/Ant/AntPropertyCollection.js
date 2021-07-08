const { GameObject } = require("../GameObject")

module.exports = class AntPropertyCollection extends GameObject {
    constructor({ world, capacity, color }) {
        super(world)
        this.currentId = 0
        this.antId = new Uint16Array(capacity)
        this.positionX = new Float32Array(capacity)
        this.positionY = new Float32Array(capacity)
        this.rotation = new Float32Array(capacity)
        this.speed = new Float32Array(capacity)
        this.carryingFood = new Uint32Array(capacity)
        this.freshness = new Float32Array(capacity)
        this.freshnessDecay = new Float32Array(capacity)
        this.decideIdx = new Uint8Array(capacity)
    }

    registerId() { return this.currentId++ }

    getPosition(id) { return { x: this.positionX[id], y: this.positionY[id] } }
    setPosition(id, pos) {
        this.positionX[id] = pos.x
        this.positionY[id] = pos.y
    }

    getRotation(id) { return this.rotation[id] }
    setRotation(id, rotation) { this.rotation[id] = rotation }

    getSpeed(id) { return this.speed[id] }
    setSpeed(id, speed) { this.speed[id] = speed }

    getCarryingFood(id) { return this.carryingFood[id] }
    setCarryingFood(id, carryingFood) { this.carryingFood[id] = carryingFood }

    getFreshness(id) { return this.freshness[id] }
    setFreshness(id, freshness) { this.freshness[id] = freshness }

    getFreshnessDecay(id) { return this.freshnessDecay[id] }
    setFreshnessDecay(id, decay) { this.freshnessDecay[id] = decay }

    getDecideIdx(id) { return this.decideIdx[id] }
    setDecideIdx(id, decideIdx) { this.decideIdx[id] = decideIdx }
}