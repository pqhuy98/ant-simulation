export class Timer {
    constructor() {
        this.t0 = performance.now()
        this.t = this.t0
    }

    tick() {
        let now = performance.now()
        let dt = now - this.t
        this.t = now
        return dt
    }

    dt0() {
        return performance.now() - this.t0
    }

    dt() {
        return performance.now() - this.t
    }
}

export class Profiler {
    constructor() {
        this.values = {}
    }

    put(name, value) {
        this.values[name] = value
    }

    get(name) {
        return this.values[name] || 0
    }

    print() {
        // console.log("--------------------------------")
        // Object.keys(this.values).forEach(k => {
        //     let percent = (this.values["TOTAL"] ? Math.floor(this.values[k] / this.values["TOTAL"] * 100) : "--")
        //     console.log(k, "\t", percent, this.values[k])
        // })
    }

    reset() {
        this.values = {}
    }
}

export class NullProfiler extends Profiler {
    put() { }
    get() { return 0 }
    print() { }
    reset() { }
}