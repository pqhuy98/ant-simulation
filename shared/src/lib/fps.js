const perfnow = require("performance-now")

class FpsCalculator {
    constructor({ onTick }) {
        this.times = []
        this.frameCount = 0
        this.onTick = onTick
    }

    tick() {
        let now = perfnow()
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
            this.times.shift()
        }
        this.times.push(now)
        this.frameCount++
        if (typeof this.onTick === "function") {
            this.onTick(this.get())
        }
    }

    get() {
        return this.times.length
    }
}

module.exports = {
    FpsCalculator
}