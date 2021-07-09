// @ts-nocheck
import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"

export default function Canvas({ width, height, draw }) {
    const refBackground = useRef(null)
    const refTrailFood = useRef(null)
    const refTrailHome = useRef(null)
    const refAnt = useRef(null)
    const refFood = useRef(null)
    const refWall = useRef(null)

    useEffect(() => {
        const ctxs = {
            ctxBackground: refBackground.current.getContext("2d"),
            ctxFoodTrail: refTrailFood.current.getContext("2d"),
            ctxHomeTrail: refTrailHome.current.getContext("2d"),
            ctxAnt: refAnt.current.getContext("2d"),
            ctxFood: refFood.current.getContext("2d"),
            ctxWall: refWall.current.getContext("2d"),
        }

        // first draw after construction
        draw(ctxs)

        let animationFrameId
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render)

            draw(ctxs)

        }
        render()
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])

    return <div style={{
        width: window.innerWidth + "px",
        height: (height * window.innerWidth / width) + "px",
        ...style.container
    }} >
        <canvas style={{ ...style.canvas, zIndex: 1 }} ref={refBackground} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 2 }} ref={refTrailFood} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 3 }} ref={refTrailHome} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 4 }} ref={refAnt} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 5 }} ref={refFood} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 6 }} ref={refWall} width={width} height={height} />
    </div>
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    next: PropTypes.func,
    fpsCalculator: PropTypes.object
}

const style = {
    container: {
        position: "relative",
        textAlign: "left",
    },
    canvas: {
        position: "absolute",
        width: "100%",
        height: "100%",
    }
}