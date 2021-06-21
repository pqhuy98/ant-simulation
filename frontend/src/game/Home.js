import { t } from "config/Themes"

export default class Home {
    constructor({ width, height, colonyCount }) {
        this.width = width
        this.height = height
        this.locations = [...Array(colonyCount)].map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
        }))
        this.food = 0
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
    }

    render(ctx) {
        this.locations.forEach(loc => {
            ctx.beginPath()
            ctx.arc(loc.x, loc.y, 5, 0, 2 * Math.PI, false)
            ctx.fillStyle = t().homeColor
            ctx.fill()
            ctx.stroke()
        })
    }
}