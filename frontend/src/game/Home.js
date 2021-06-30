import { t } from "config/Themes"
import { randomInt } from "lib/basic_math"

export default class Home {
    constructor({ width, height, colonyCount, world }) {
        this.width = width
        this.height = height
        this.world = world
        this.locations = []
        this.size = 5
        while (this.locations.length < colonyCount) {
            let loc = {
                x: Math.random() * width,
                y: Math.random() * height,
            }
            if (world.wall.allowCircle({ ...loc, sz: this.size })) {
                this.locations.push(loc)
            }
        }
        this.food = 0
    }

    gameLoop() {
        let radius = this.size + 2
        this.locations.forEach((loc) => {
            let { x: xc, y: yc } = loc
            for (let x = xc - radius; x < xc + radius; x++) {
                let yspan = radius * Math.sin(Math.acos((xc - x) / radius))
                for (let y = yc - yspan; y < yc + yspan; y++) {
                    if (x < 0 || x > this.width || y < 0 || y > this.height) continue
                    this.world.homeTrail.put(x, y, 1)
                }
            }
        })
    }

    randomPosition() {
        return this.locations[randomInt(0, this.locations.length)]
    }

    has(x, y, sz) {
        x = Math.floor(x)
        y = Math.floor(y)
        for (let i = 0; i < this.locations.length; i++) {
            if (Math.abs(x - this.locations[i].x) <= sz && Math.abs(y - this.locations[i].y) <= sz) {
                return [this.locations[i].x, this.locations[i].y]
            }
        }
        return null
    }

    give(amount) {
        this.food += amount
        this.world.storedFood += amount
    }

    render(ctx) {
        this.locations.forEach(loc => {
            ctx.beginPath()
            ctx.arc(loc.x, loc.y, this.size, 0, 2 * Math.PI, false)
            ctx.fillStyle = t().homeColor
            ctx.fill()
            ctx.stroke()
        })
    }
}