class GameObject {
    constructor(world) {
        if (world) {
            // inherit special properties from world
            if (!("world" in this)) {
                this.world = world
            }
            if (world && !("_id" in this)) {
                this._id = world.registerId()
            }
            if (world && !("r" in this)) {
                this.r = world.r
            }
        }
    }

    serializableKeys() {
        return Object.keys(this)
    }

    postConstruct() { }

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