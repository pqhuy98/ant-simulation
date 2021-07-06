function compareWorld(w1, w2) {
    if (w1.pickedFood !== w2.pickedFood ||
        w1.storedFood !== w2.storedFood ||
        w1.unpickedFood !== w2.unpickedFood) {
        return false
    }
    if (w1.ants.length !== w2.ants.length) {
        return false
    }
    for (let i = 0; i < w1.foodTrail.rawMap.length; i++) {
        if (w1.foodTrail.rawMap[i] !== w2.foodTrail.rawMap[i]) {
            console.log(i)
            console.log(w1.foodTrail.rawMap[i])
            console.log(w2.foodTrail.rawMap[i])
            return false
        }
    }

    for (let i = 0; i < w1.ants.length; i++) {
        let a1 = w1.ants[i]
        let a2 = w2.ants[i]
        if (a1.rotation !== a2.rotation) {
            console.log(a1._id)
            console.log(a2._id)
            return false
        }
    }
    return true
}

module.exports = {
    compareWorld
}