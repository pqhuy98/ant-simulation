const Typeson = require('typeson');
const Ant = require('../Ant/Ant');
const PropertyCollection = require('../Ant/PropertyCollection');
const ChemicalMap3x3 = require('../ChemicalMap/ChemicalMap_3x3');
const ChemicalMap2x2 = require('../ChemicalMap/ChemicalMap_2x2');
const { Food } = require('../Food');
const Home = require('../Home');
const { Random } = require('../Random');
const Wall = require('../Wall');
const World = require('../World');
const ndarray = require("ndarray");
const Colony = require('../Ant/Colony');

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

function newLink(obj) {
    return "_l#" + obj._id
}

function idFromLink(link) {
    return link.slice(3)
}

function isLink(obj) {
    return (typeof obj === "string" && obj.startsWith("_l#"))
}

function isPrimitive(test) {
    return test !== Object(test);
}

function isTypedArray(a) {
    return !!(a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT);
}

// @ts-ignore
const typeson = new Typeson().register([
    require('typeson-registry/dist/presets/socketio')
]).register({
    Colony,
    PropertyCollection,
    ChemicalMap2x2,
    ChemicalMap3x3,
    Food,
    Home,
    Random,
    Wall,
    World,
    ndarray: [
        testNdarray,
        replaceNdarray,
        reviveNdarray
    ]
});

module.exports = {
    typeson,
    testNdarray,
    newLink,
    idFromLink,
    isLink,
    isPrimitive,
    isTypedArray
}