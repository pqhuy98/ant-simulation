import React, { useState } from "react"
import PropTypes from "prop-types"
import { Themes } from "config/Themes"
import { useLocation } from "react-router-dom"

export function Header({ children }) {
    return <div style={style.header}>
        {children}
    </div>
}
Header.propTypes = {
    children: PropTypes.node,
}


export function ThemeLinks() {
    let links = []
    for (const theme in Themes) {
        links.push(<Link key={theme} text={theme} url={"/" + theme.toLowerCase()} />)
    }
    return links
}

function Link({ text, url }) {
    const [hover, setHover] = useState(false)
    const location = useLocation()

    return <a
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
            ...style.link,
            ...(hover ? style.link_hover : null),
            ...(location.pathname === url ? style.link_selected : null),
        }}

        href={url}>

        {text}
    </a>
}
Link.propTypes = {
    text: PropTypes.string,
    url: PropTypes.string,
}

export function GithubLink() {
    return <a style={style.githubLink} href={"https://github.com/pqhuy98/ant-simulation"} >
        Github
    </a >
}

const style = {
    header: {
        padding: "13px",
    },
    link: {
        color: "white",
        padding: "10px",
        textDecoration: "none",
    },
    link_hover: {
        background: "#444",
    },
    link_selected: {
        borderTop: "3px solid white",
    },
    githubLink: {
        color: "white",
        padding: "10px",
        marginLeft: "100px",
    }
}