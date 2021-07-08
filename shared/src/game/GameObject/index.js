class GameObject {
    constructor(world) {
        if (world) {
            // inherit special properties from world
            this.world = world
            this._id = world.registerId()
            this.r = world.r
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