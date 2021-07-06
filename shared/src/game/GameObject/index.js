class GameObject {
    constructor(world) {
        if (world) {
            // this is not root
            this.world = world
            this._id = world.requestId()
            this.r = world.r
        } else {
            // this is root
            // noop
        }
    }

    static isGameObject(obj) {
        return "_id" in Object(obj)
    }

    static toLink(obj) {
        return { _id: obj._id }
    }

    static createNull() {
        return Object.create(this.prototype);
    }
}

module.exports = {
    GameObject,
}