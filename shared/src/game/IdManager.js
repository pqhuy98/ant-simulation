class IdManager {
    constructor() {
        this.currentId = 0
        this._id = this.requestId()
    }

    requestId() {
        return this.currentId++
    }
}

module.exports = IdManager