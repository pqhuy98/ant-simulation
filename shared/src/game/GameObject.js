const IdManager = require("./IdManager")
const { childRng } = require("./Random")

class GameObject {
    constructor(world) {
        if (world) {
            // this is not root
            this.world = world
            this._id = world.idm.requestId()
            this.r = childRng(world.r)
        } else {
            // this is root
            this.idm = new IdManager()
            this._id = this.idm.requestId()
        }
    }
}

module.exports = {
    GameObject
}