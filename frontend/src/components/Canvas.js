// @ts-nocheck
import React, { useRef, useEffect, useMemo } from "react"
import PropTypes from "prop-types"

export default function Canvas({ width, height, draw, homeTrailCount, trailScale }) {
    const refBackground = useRef(null)
    const refTrailFood = useRef(null)
    const refTrailHome = useMemo(() => {
        return Array(homeTrailCount)
            .fill(0)
            .map(() => React.createRef())
    }, [homeTrailCount])
    const refAnt = useRef(null)
    const refFood = useRef(null)
    const refWall = useRef(null)
    const refHome = useRef(null)

    useEffect(() => {
        const ctxs = {
            ctxBackground: refBackground.current.getContext("2d"),
            ctxFoodTrail: refTrailFood.current.getContext("2d"),
            ctxHomeTrail: refTrailHome.map(cvsRef => cvsRef.current.getContext("2d")),
            ctxAnt: refAnt.current.getContext("2d"),
            ctxFood: refFood.current.getContext("2d"),
            ctxWall: refWall.current.getContext("2d"),
            ctxHome: refHome.current.getContext("2d"),
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
    }, [draw, homeTrailCount, trailScale])

    let trailWidth = ~~(width / trailScale)
    let trailHeight = ~~(height / trailScale)

    return <div style={{
        width: window.innerWidth + "px",
        height: (height * window.innerWidth / width) + "px",
        ...style.container
    }} >
        <canvas style={{ ...style.canvas, zIndex: 1 }} ref={refBackground} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 2 }} ref={refTrailFood} width={trailWidth} height={trailHeight} />
        {Array(homeTrailCount).fill(0).map((_, i) =>
            <canvas key={i} ref={refTrailHome[i]} style={{ ...style.canvas, zIndex: 3 }} width={trailWidth} height={trailHeight} />
        )}
        <canvas style={{ ...style.canvas, zIndex: 4 }} ref={refAnt} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 5 }} ref={refFood} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 6 }} ref={refHome} width={width} height={height} />
        <canvas style={{ ...style.canvas, zIndex: 7 }} ref={refWall} width={width} height={height} />
    </div>
}
Canvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    draw: PropTypes.func,
    homeTrailCount: PropTypes.number,
    trailScale: PropTypes.number,
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