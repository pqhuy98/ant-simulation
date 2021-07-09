const perfnow = require("performance-now")

class Timer {
    constructor() {
        this.t0 = perfnow()
        this.t = this.t0
    }

    tick() {
        let now = perfnow()
        let dt = now - this.t
        this.t = now
        return dt
    }

    dt0() {
        return perfnow() - this.t0
    }

    dt() {
        return perfnow() - this.t
    }
}

class Profiler {
    constructor() {
        this.values = {}
        this.timer = new Timer()
    }

    tick(name) {
        let res = this.timer.tick()
        if (name) {
            this.values[name] = (this.values[name] || 0) + res
        }
        return res
    }

    get(name) {
        return this.values[name] || 0
    }

    print(totalName) {
        console.log("--------------------------------")
        let mxLen = 0
        Object.keys(this.values).forEach(k => (mxLen = Math.max(mxLen, k.length)))
        Object.keys(this.values).forEach(k => {
            if (!k.startsWith("#")) return
            console.log(k, "   ", this.values[k])
        })

        Object.keys(this.values).forEach(k => {
            if (k.startsWith("#")) return
            let percent = (this.values[totalName] ? ~~(this.values[k] / this.values[totalName] * 100) : "--")
            let formattedKey = k
            while (formattedKey.length < mxLen) formattedKey += " "
            console.log(formattedKey, "\t", percent, "%\t", this.values[k], "ms")
        })
    }

    reset(name = null) {
        if (name) {
            delete this.values[name]
        } else {
            // reset all
            this.values = {}
        }
    }

    put(name, value) {
        this.values[name] = value
    }

    elapse() {
        return this.timer.dt0()
    }
}

class NullProfiler extends Profiler {
    put() { }
    get() { return 0 }
    print() { }
    reset() { }
}

module.exports = {
    Timer,
    Profiler,
    NullProfiler,
}