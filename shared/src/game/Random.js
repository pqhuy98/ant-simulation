const { randomInt } = require("../lib/basic_math")
const { GameObject } = require("./GameObject")

const LETTERS = "0123456789ABCDEF"
const MAX_VALUE = 2147483647

function freshRNG() {
    return new Random(
        Math.max(1, ~~(Math.random() * MAX_VALUE)),
        randomInt(0, primes.length),
        randomInt(0, primes.length),
    )
}

class Random extends GameObject {
    constructor(seed, prime1Idx, prime2Idx) {
        super()
        this._id = "r"
        this.initialSeed = seed
        this.seed = seed
        this.prime1 = primes[prime1Idx]
        this.prime2 = primes[prime2Idx]
        this.nextInt()
    }

    nextInt() {
        this.seed = (this.seed * this.prime1 + this.prime2) % MAX_VALUE
        if (this.seed === this.initialSeed) {
            // the cycle has completed, rotate to new primes
            this.primes1 = this.randomInt(0, primes.length)
            this.prime2 = this.randomInt(0, primes.length)
        }
        return this.seed
    }

    random() {
        return (this.nextInt() - 1) / (MAX_VALUE - 1)
    }

    randomFloat(l, r) {
        return this.random() * (r - l) + l
    }

    randomInt(l, r) {
        return ~~(this.randomFloat(l, r))
    }

    randomExp(l, r) {
        return Math.exp(this.randomFloat(Math.log(l), Math.log(r)))
    }

    randomColor() {
        var color = "#"
        for (var i = 0; i < 6; i++) {
            color += LETTERS[this.randomInt(0, 16)]
        }
        return color
    }

    pickRandom(arr) {
        return arr[this.randomInt(0, arr.length)]
    }

    pickRandomWithProbabilities(arr, probs) {
        if (probs.length !== arr.length - 1) {
            throw new Error("probs.length must be equal to (arr.length - 1).")
        }
        let dice = this.random();
        let accumProb = 0;
        for (let i = 0; i < probs.length; i++) {
            accumProb += probs[i];
            if (accumProb > dice) {
                return arr[i];
            }
        }
        return arr[arr.length - 1]
    }

    prob(chance) {
        return this.random() <= chance
    }

    spawnChildRng() {
        return new Random(this.nextInt(), this.randomInt(0, primes.length), this.randomInt(0, primes.length))
    }
}



// list of primes for RNG
const primes = [
    43669, 43691, 43711, 43717, 43721, 43753, 43759, 43777, 43781, 43783,
    43591, 43597, 43607, 43609, 43613, 43627, 43633, 43649, 43651, 43661,
    43787, 43789, 43793, 43801, 43853, 43867, 43889, 43891, 43913, 43933,
    43943, 43951, 43961, 43963, 43969, 43973, 43987, 43991, 43997, 44017,
    44021, 44027, 44029, 44041, 44053, 44059, 44071, 44087, 44089, 44101,
    44111, 44119, 44123, 44129, 44131, 44159, 44171, 44179, 44189, 44201,
    44203, 44207, 44221, 44249, 44257, 44263, 44267, 44269, 44273, 44279,
    44281, 44293, 44351, 44357, 44371, 44381, 44383, 44389, 44417, 44449,
    44453, 44483, 44491, 44497, 44501, 44507, 44519, 44531, 44533, 44537,
    44543, 44549, 44563, 44579, 44587, 44617, 44621, 44623, 44633, 44641,
    44647, 44651, 44657, 44683, 44687, 44699, 44701, 44711, 44729, 44741,
    44753, 44771, 44773, 44777, 44789, 44797, 44809, 44819, 44839, 44843,
    44851, 44867, 44879, 44887, 44893, 44909, 44917, 44927, 44939, 44953,
    44959, 44963, 44971, 44983, 44987, 45007, 45013, 45053, 45061, 45077,
    45083, 45119, 45121, 45127, 45131, 45137, 45139, 45161, 45179, 45181,
    45191, 45197, 45233, 45247, 45259, 45263, 45281, 45289, 45293, 45307,
    45317, 45319, 45329, 45337, 45341, 45343, 45361, 45377, 45389, 45403,
    45413, 45427, 45433, 45439, 45481, 45491, 45497, 45503, 45523, 45533,
    45541, 45553, 45557, 45569, 45587, 45589, 45599, 45613, 45631, 45641,
    45659, 45667, 45673, 45677, 45691, 45697, 45707, 45737, 45751, 45757,
    45763, 45767, 45779, 45817, 45821, 45823, 45827, 45833, 45841, 45853,
    45863, 45869, 45887, 45893, 45943, 45949, 45953, 45959, 45971, 45979,
    45989, 46021, 46027, 46049, 46051, 46061, 46073, 46091, 46093, 46099,
    46103, 46133, 46141, 46147, 46153, 46171, 46181, 46183, 46187, 46199,
    46219, 46229, 46237, 46261, 46271, 46273, 46279, 46301, 46307, 46309,
    46327, 46337, 46349, 46351, 46381, 46399, 46411, 46439, 46441, 46447,
    46451, 46457, 46471, 46477, 46489, 46499, 46507, 46511, 46523, 46549,
    46559, 46567, 46573, 46589, 46591, 46601, 46619, 46633, 46639, 46643,
    46649, 46663, 46679, 46681, 46687, 46691, 46703, 46723, 46727, 46747,
    46751, 46757, 46769, 46771, 46807, 46811, 46817, 46819, 46829, 46831,
    46853, 46861, 46867, 46877, 46889, 46901, 46919, 46933, 46957, 46993,
    46997, 47017, 47041, 47051, 47057, 47059, 47087, 47093, 47111, 47119,
    47123, 47129, 47137, 47143, 47147, 47149, 47161, 47189, 47207, 47221,
    47237, 47251, 47269, 47279, 47287, 47293, 47297, 47303, 47309, 47317,
    47339, 47351, 47353, 47363, 47381, 47387, 47389, 47407, 47417, 47419,
    47431, 47441, 47459, 47491, 47497, 47501, 47507, 47513, 47521, 47527,
    47533, 47543, 47563, 47569, 47581, 47591, 47599, 47609, 47623, 47629,
    47639, 47653, 47657, 47659, 47681, 47699, 47701, 47711, 47713, 47717,
    47737, 47741, 47743, 47777, 47779, 47791, 47797, 47807, 47809, 47819,
    47837, 47843, 47857, 47869, 47881, 47903, 47911, 47917, 47933, 47939,
    47947, 47951, 47963, 47969, 47977, 47981, 48017, 48023, 48029, 48049,
    48073, 48079, 48091, 48109, 48119, 48121, 48131, 48157, 48163, 48179,
    48187, 48193, 48197, 48221, 48239, 48247, 48259, 48271, 48281, 48299,
    48311, 48313, 48337, 48341, 48353, 48371, 48383, 48397, 48407, 48409,
    48413, 48437, 48449, 48463, 48473, 48479, 48481, 48487, 48491, 48497,
    48523, 48527, 48533, 48539, 48541, 48563, 48571, 48589, 48593, 48611,
    48619, 48623, 48647, 48649, 48661, 48673, 48677, 48679, 48731, 48733,
    48751, 48757, 48761, 48767, 48779, 48781, 48787, 48799, 48809, 48817,
    48821, 48823, 48847, 48857, 48859, 48869, 48871, 48883, 48889, 48907,
    48947, 48953, 48973, 48989, 48991, 49003, 49009, 49019, 49031, 49033,
    49037, 49043, 49057, 49069, 49081, 49103, 49109, 49117, 49121, 49123,
    49139, 49157, 49169, 49171, 49177, 49193, 49199, 49201, 49207, 49211,
    49223, 49253, 49261, 49277, 49279, 49297, 49307, 49331, 49333, 49339,
    49363, 49367, 49369, 49391, 49393, 49409, 49411, 49417, 49429, 49433,
    49451, 49459, 49463, 49477, 49481, 49499, 49523, 49529, 49531, 49537,
    49547, 49549, 49559, 49597, 49603, 49613, 49627, 49633, 49639, 49663,
    49667, 49669, 49681, 49697, 49711, 49727, 49739, 49741, 49747, 49757,
    49783, 49787, 49789, 49801, 49807, 49811, 49823, 49831, 49843, 49853,
    49871, 49877, 49891, 49919, 49921, 49927, 49937, 49939, 49943, 49957,
    49991, 49993, 49999, 50021, 50023, 50033, 50047, 50051, 50053, 50069,
    50077, 50087, 50093, 50101, 50111, 50119, 50123, 50129, 50131, 50147,
    50153, 50159, 50177, 50207, 50221, 50227, 50231, 50261, 50263, 50273,
    50287, 50291, 50311, 50321, 50329, 50333, 50341, 50359, 50363, 50377,
    50383, 50387, 50411, 50417, 50423, 50441, 50459, 50461, 50497, 50503,
    50513, 50527, 50539, 50543, 50549, 50551, 50581, 50587, 50591, 50593,
    50599, 50627, 50647, 50651, 50671, 50683, 50707, 50723, 50741, 50753,
    50767, 50773, 50777, 50789, 50821, 50833, 50839, 50849, 50857, 50867,
    50873, 50891, 50893, 50909, 50923, 50929, 50951, 50957, 50969, 50971,
    50989, 50993, 51001, 51031, 51043, 51047, 51059, 51061, 51071, 51109,
    51131, 51133, 51137, 51151, 51157, 51169, 51193, 51197, 51199, 51203,
    51217, 51229, 51239, 51241, 51257, 51263, 51283, 51287, 51307, 51329,
    51341, 51343, 51347, 51349, 51361, 51383, 51407, 51413, 51419, 51421,
]

module.exports = {
    Random,
    primes,
    freshRNG,
}