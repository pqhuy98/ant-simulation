const ndarray = require("ndarray")
const { Timer } = require("../../lib/performance")
const { GameObject } = require("./index")
const { testNdarray, typeson, newLink, isLink, isTypedArray, isPrimitive, idFromLink } = require("./tson")

class Serializer {
    constructor(obj) {
        this.objMap = { __root: obj._id }
        this.transferables = []
        this.flatten(obj)
    }

    /**
     * Convert a graph of objects and object references to a flatten hash table and links.
     *  Use depth-first-search style graph traversal.
     * @param {object} node Current node
     * @param {*} startOfPath 
     * @returns 
     */
    flatten(node, startOfPath = true) {
        // not the start of a GameObject, replace it with a Link. 
        if (node instanceof GameObject && !startOfPath) {
            if (!(node._id in this.objMap)) {
                // not visited before, start new path from this.
                this.flatten(node, true)
            }
            return newLink(node)
        }

        if (isPrimitive(node)) {
            return node
        }
        if (isTypedArray(node)) {
            let res = new node.constructor(node)
            this.transferables.push(res.buffer)
            return res
        }
        if (testNdarray(node)) {
            let res = ndarray(new node.data.constructor(node.data), node.shape, node.stride)
            this.transferables.push(res.data.buffer)
            return res
        }
        if (Array.isArray(node)) {
            return node.map((child) =>
                this.flatten(child, false))
        }

        // from here, node must be either an unvisited GameObject, or a plain object.
        let result = {}
        let keys
        if (node instanceof GameObject) {
            this.objMap[node._id] = 1 // mark as visited, use 1 as a "temporary value"
            result = node.constructor.createNull()
            keys = node.serializableKeys()
        } else {
            // is normal object
            keys = Object.keys(node)
        }

        for (const key of keys) {
            if (typeof node[key] === "function") continue
            result[key] = this.flatten(node[key], false)
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
        this.deserialize(this.root())
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
            if (isLink(node[key])) {
                // unlink
                node[key] = this.objMap[idFromLink(node[key])]
            }
            if (node[key] instanceof GameObject && this.done[node[key]._id]) {
                // already processed, skip
                continue
            }
            this.deserialize(node[key])
        }
        if (node instanceof GameObject) {
            node.postConstruct()
        }
    }

    root() {
        return this.objMap[this.objMap.__root]
    }
}

// Exports

function encapsulate(obj) {
    // let timer = new Timer()
    let ser = new Serializer(obj)
    // console.log("serialize", timer.tick())
    let res = typeson.encapsulate(ser.objMap)
    // console.log("encap", timer.tick())
    return {
        data: res,
        transferables: ser.transferables,
    }
}

function revive(encapsulatedObjMap) {
    // let timer = new Timer()
    let objMap = typeson.revive(encapsulatedObjMap)
    // console.log("typeson.revive", timer.tick())
    let des = new Deserializer(objMap)
    // console.log("Deserializer", timer.tick())
    return des.root()
}

module.exports = {
    encapsulate, revive, //, stringify, parse
}