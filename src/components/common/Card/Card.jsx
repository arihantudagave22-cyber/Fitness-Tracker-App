import "./Card.css";

const Card = ({
    children,
    className = "",
    padding = "default",
    hover = false,
    ...props
}) => {
    const classes = [
        "card",
        `card--${padding}`,
        hover ? "card--hover" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;