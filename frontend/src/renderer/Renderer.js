const { Profiler } = require("antworld-shared/src/lib/performance")

module.exports = class Renderer {
    constructor({ worldRef, renderFiltersRef, postRender }) {
        this.worldRef = worldRef
        this.renderFiltersRef = renderFiltersRef
        this.postRender = postRender
        this.lastVersion = Number.NEGATIVE_INFINITY
        this.lastTime = Number.NEGATIVE_INFINITY
        this.latestDeltaT = 1000 / 60
        this.step = 0
    }

    get world() { return this.worldRef.current }
    get renderFilters() { return this.renderFiltersRef.current }

    render(ctxs) {
        this.step++
        if (this.step > 10000000) this.step = 0

        if (this.world?.version !== this.lastVersion) {
            this.latestDeltaT = this.world?.receivedTime - this.lastTime
            this.lastTime = this.world?.receivedTime
        }
        this.lastVersion = this.world?.version || Number.NEGATIVE_INFINITY
        let extraTime = (performance.now() - this.world?.receivedTime) / this.latestDeltaT

        let profiler = new Profiler()
        profiler.put("#World version", this.world?.version)

        if (this.world) {
            this.world.disabledRenders = this.renderFilters
        }
        this.world?.render({
            profiler,
            extraTime,
            step: this.step,
            ...ctxs,
        })

        if (typeof this.postRender === "function") {
            this.postRender({ renderer: this, profiler })
        }
    }

    buildFilterSetters() {
        return {
            wall: (val) => {
                this.renderFiltersRef.current.wall = val
            },
            food: (val) => {
                this.renderFiltersRef.current.food = val
            },
            antsToFood: (val) => {
                this.renderFiltersRef.current.antsToFood = val
            },
            antsToHome: (val) => {
                this.renderFiltersRef.current.antsToHome = val
            },
        }
    }
}