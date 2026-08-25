import "./Button.css";

const Button = ({
    children,
    variant = "primary",
    size = "medium",
    icon,
    iconPosition = "left",
    loading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    className = "",
    ...props
}) => {
    const classes = [
        "button",
        `button--${variant}`,
        `button--${size}`,
        fullWidth ? "button--full" : "",
        loading ? "button--loading" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="button__loader" />
            ) : (
                <>
                    {icon && iconPosition === "left" && (
                        <span className="button__icon">
                            {icon}
                        </span>
                    )}

                    <span>{children}</span>

                    {icon && iconPosition === "right" && (
                        <span className="button__icon">
                            {icon}
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;