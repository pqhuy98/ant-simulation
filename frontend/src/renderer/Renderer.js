const { Profiler } = require("antworld-shared/src/lib/performance")

module.exports = class Renderer {
    constructor({ worldRef, postRender }) {
        this.worldRef = worldRef
        this.postRender = postRender
        this.lastVersion = Number.NEGATIVE_INFINITY
        this.lastTime = Number.NEGATIVE_INFINITY
        this.latestDeltaT = 1000
        this.step = 0
    }

    render(ctxs) {
        this.step++
        if (this.step > 10000000) this.step = 0

        if (this.worldRef.current?.version !== this.lastVersion) {
            this.latestDeltaT = this.worldRef.current?.receivedTime - this.lastTime
            this.lastTime = this.worldRef.current?.receivedTime
        }
        this.lastVersion = this.worldRef.current?.version || Number.NEGATIVE_INFINITY
        let extraTime = (performance.now() - this.worldRef.current?.receivedTime) / this.latestDeltaT

        let profiler = new Profiler()
        profiler.put("#World version", this.worldRef.current?.version)

        this.worldRef.current?.render({
            profiler,
            extraTime,
            step: this.step,
            ...ctxs,
        })

        if (typeof this.postRender === "function") {
            this.postRender({ renderer: this, profiler })
        }
    }
}