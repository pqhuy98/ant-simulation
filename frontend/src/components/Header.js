import React, { useState } from "react"
import PropTypes from "prop-types"
import { Themes } from "config/Themes"

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
    links.push(<Link key={"/"} text="RANDOM" url="/" />)
    for (const theme in Themes) {
        links.push(<Link key={theme} text={theme} url={theme.toLowerCase()} />)
    }
    return links
}

function Link({ text, url }) {
    const [hover, setHover] = useState(false)
    return <a
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
            ...style.link,
            ...(hover ? style.link_hover : null)
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
        padding: "30px",
    },
    link: {
        color: "white",
        padding: "10px",
        textDecoration: "none",
    },
    link_hover: {
        background: "#444"
    },
    githubLink: {
        color: "white",
        padding: "10px",
        marginLeft: "100px",
    }
}