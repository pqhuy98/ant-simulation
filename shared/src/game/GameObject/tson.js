
const Typeson = require('typeson');
const Ant = require('../Ant');
const ChemicalMap3x3 = require('../ChemicalMap-fast3x3');
const { Food } = require('../Food');
const Home = require('../Home');
const { Random } = require('../Random');
const Wall = require('../Wall');
const World = require('../World');
const ndarray = require("ndarray")

const ndarrayMap = {
    "int8": Int8Array,
    "int16": Int16Array,
    "int32": Int32Array,
    "uint8": Uint8Array,
    "uint16": Uint16Array,
    "uint32": Uint32Array,
    "bigint64": BigInt64Array,
    "biguint64": BigUint64Array,
    "float32": Float32Array,
    "float64": Float64Array,
    "array": Array,
    "uint8_clamped": Uint8ClampedArray,
    "buffer": Buffer,
}

function testNdarray(arr) {
    if (!arr) return false
    if (!arr.dtype) return false
    var re = new RegExp('function View[0-9]+d(:?' + arr.dtype + ')+')
    let result = re.test(String(arr.constructor))
    return result
}
function replaceNdarray(arr) {
    return { ...arr, dtype: arr.dtype }
}
function reviveNdarray(data) {
    let TypedArray = ndarrayMap[data.dtype]
    let placeholder = ndarray(new TypedArray(0), data.shape)
    Object.assign(placeholder, data)
    return placeholder
}


class Link {
    constructor(obj) {
        this._id = obj._id;
    }
}

const typeson = new Typeson().register([
    require('typeson-registry/dist/presets/builtin')
]).register({
    Ant,
    ChemicalMap3x3,
    Food,
    Home,
    Random,
    Wall,
    World,
    Link,
    ndarray: [
        testNdarray,
        replaceNdarray,
        reviveNdarray
    ]
});

module.exports = {
    typeson,
    testNdarray,
    Link,
}