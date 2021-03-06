function compareWorld(w1, w2) {
    if (w1.pickedFood !== w2.pickedFood ||
        w1.storedFood !== w2.storedFood ||
        w1.unpickedFood !== w2.unpickedFood) {
        return false
    }
    if (w1.totalAnts !== w2.totalAnts) {
        return false
    }
    for (let i = 0; i < w1.foodTrail.rawMap.length; i++) {
        if (w1.foodTrail.rawMap[i] !== w2.foodTrail.rawMap[i]) {
            console.log("Differ in foodTral,    idx =", i)
            console.log(w1.foodTrail.rawMap[i])
            console.log(w2.foodTrail.rawMap[i])
            return false
        }
    }

    for (let i = 0; i < w1.colonies.length; i++) {
        for (let j = 0; j < w1.colonies[i].ants.length; j++) {
            let a1 = w1.colonies[i].ants[j]
            let a2 = w2.colonies[i].ants[j]
            if (a1.rotation !== a2.rotation) {
                console.log("Differ in Ant rotation,     i =", i, "    _idx =", a1._id, a2._id)
                console.log(a1._id, a1.rotation)
                console.log(a2._id, a2.rotation)
                return false
            }
        }
    }
    return true
}

module.exports = {
    compareWorld
}