const { GameObject } = require("./index")
const { testNdarray, typeson, Link } = require("./tson")

class Serializer {
    constructor(obj) {
        this.objMap = { __root: obj._id }
        this.serialize(obj)
    }

    serialize(node, depth = 0) {
        let result = {}
        let keys
        if (isPrimitive(node) || isTypedArray(node) || testNdarray(node)) {
            return node
        } else if (Array.isArray(node)) {
            return node.map((child) =>
                this.serialize(child, depth + 1))
        }
        // from here, must be object
        else if (node instanceof GameObject && depth === 0) {
            // start of of a GameObject
            this.objMap[node._id] = 1 // mark as visited, use 1 as a "temporary value"
            // @ts-ignore
            result = node.constructor.createNull()
            keys = Object.keys(node)
        } else if (node instanceof GameObject && depth > 0) {
            // not the start of a game object, then must be a link
            if (!(node._id in this.objMap)) {
                // not visited before, set depth to 0 to start from it.
                this.serialize(node, 0)
            }
            return new Link(node)
        } else {
            // is normal object
            keys = Object.keys(node)
        }

        for (const key of keys) {
            if (typeof node[key] === "function") continue
            result[key] = this.serialize(node[key], depth + 1)
        }

        if (node instanceof GameObject) {
            // replace the "temporary value" with actual result
            this.objMap[node._id] = result
        }

        return result
    }
}

class Deserializer {
    constructor(data) {
        this.objMap = data
        this.done = {}
        this.deserialize(this.objMap[this.objMap.__root])
    }

    deserialize(node) {
        if (isPrimitive(node) || isTypedArray(node) || testNdarray(node)) {
            return
        }
        // from here, must be object or array
        else if (node instanceof GameObject) {
            this.done[node._id] = true
        }
        let keys = Object.keys(node)
        for (const key of keys) {
            if (key === "wall") {
                let x
            }
            if (node[key] instanceof Link) {
                // unlink
                node[key] = this.objMap[node[key]._id]
            }
            if (node[key] instanceof GameObject && this.done[node[key]._id]) {
                // already processed, skip
                continue
            }
            this.deserialize(node[key])
        }
    }
}

function isPrimitive(test) {
    return test !== Object(test);
}

function isTypedArray(a) {
    return !!(a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT);
}

// Exports

function encapsulate(obj) {
    let ser = new Serializer(obj)
    return ser.objMap
}

function revive(objMap) {
    let des = new Deserializer(objMap)
    return des.objMap[des.objMap.__root]
}

function stringify(obj) {
    return typeson.stringify(encapsulate(obj))
}

function parse(str) {
    return revive(typeson.parse(str))
}

module.exports = {
    encapsulate, revive, stringify, parse
}