const { add, clip, rasterizeOnePixel } = require("../../lib/basic_math")
const { directPixelManipulation } = require("../../lib/canvas_optimizer")
const { getRGB } = require("../../lib/color")
const { GameObject } = require("../GameObject")
const Ant = require("./Ant")

/**
 * A collection class to store ants' atrributes in flatten JS TypedArrays.
 * This allows super fast data serialization and data transfer between WebWorker and main thread.
 * Without this class, it takes ~1000 ms to transfer 10000 ants.
 * With this class, it only takes 5ms to transfer 100000 ants.
 */
module.exports = class PropertyCollection extends GameObject {
    constructor({ world, colony, capacity }) {
        super(world)
        this.colony = colony
        this.currentId = 0
        this.ants = []
        this.antId = new Uint16Array(capacity)
        this.positionX = new Float32Array(capacity)
        this.positionY = new Float32Array(capacity)
        this.rotation = new Float32Array(capacity)
        this.speed = new Float32Array(capacity)
        this.carryingFood = new Uint32Array(capacity)
        this.freshness = new Float32Array(capacity)
        this.freshnessDecay = new Float32Array(capacity)
        this.decideIdx = new Uint8Array(capacity)
        this.rotationCos = new Float32Array(capacity)
        this.rotationSin = new Float32Array(capacity)
    }

    registerId(_id) {
        this.antId[this.currentId] = _id
        return this.currentId++
    }

    getPosition(id) { return { x: this.positionX[id], y: this.positionY[id] } }
    setPosition(id, pos) {
        this.positionX[id] = pos.x
        this.positionY[id] = pos.y
    }

    getRotation(id) { return this.rotation[id] }
    setRotation(id, rotation) { this.rotation[id] = rotation }
    getRotationCos(id) { return this.rotationCos[id] }
    setRotationCos(id, value) { this.rotationCos[id] = value }
    getRotationSin(id) { return this.rotationSin[id] }
    setRotationSin(id, value) { this.rotationSin[id] = value }


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

    createAnt({ position, rotation, speed }) {
        this.ants.push(new Ant({
            world: this.world,
            pc: this,
            position, rotation, speed
        }))
    }

    serializableKeys() {
        return Object.keys(this).filter(k => k !== "ants")
    }

    postConstruct() {
        this.ants = []
        for (let id = 0; id < this.currentId; id++) {
            this.ants.push(Ant.reviveAnt({
                _id: this.antId[id],
                r: this.r,
                pc: this,
                pcId: id
            }))
        }
    }

    gameLoop(profiler) {
        this.ants.forEach(ant => {
            ant.gameLoop(profiler)
            // Ants cannot leave screen
            let { x, y } = ant.position
            ant.position = {
                x: Math.max(0, Math.min(this.world.width - 1, x)),
                y: Math.max(0, Math.min(this.world.height - 1, y))
            }
            // profiler.tick("ant.posClip")
        })
    }

    render({ profiler, ctx, extraTime }) {
        profiler = profiler || new NullProfiler()
        directPixelManipulation(ctx, (ctx) => {
            profiler.tick("render::ant_prepare")
            var bitmap = ctx.bitmap
            let width = ctx.canvas.width
            const colorCache = {}

            for (let i = 0; i < this.ants.length; i++) {
                let ant = this.ants[i]

                if (this.renderIsDisabled(ant)) {
                    continue
                }

                let color = ant.isCarryingFood() ? ant.foodColor : ant.color
                let colorArr = colorCache[color] || (colorCache[color] = getRGB(color))

                let { x, y } = ant.position

                // interpolate to predict transitting position
                let dSpeed = extraTime * this.world.deltaT * ant.speed
                x = x + dSpeed * ant.rotationCos
                y = y + dSpeed * ant.rotationSin

                // x = clip(Math.round(x), 0, this.world.width - 1)
                // y = clip(Math.round(y), 0, this.world.height - 1)
                // let offset = (x + y * width) * 4
                // bitmap[offset] = colorArr[0]
                // bitmap[offset + 1] = colorArr[1]
                // bitmap[offset + 2] = colorArr[2]
                // bitmap[offset + 3] = colorArr[3]

                // rasterization rendering
                rasterizeOnePixel(bitmap, x, y, colorArr, this.world.width)
            }
        }, false, true)
        profiler.tick("render::ant_post")
    }

    renderIsDisabled(ant) {
        return (ant.isCarryingFood() && this.world.disabledRenders.antsToHome ||
            !ant.isCarryingFood() && this.world.disabledRenders.antsToFood)
    }
}