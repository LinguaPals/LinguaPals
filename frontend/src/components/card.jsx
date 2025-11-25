const Card = ({ title, value, footer, children }) => {
    return (
        <div className="card">
            <h2>{title}</h2>
            {value !== undefined && (
                <p style={{ fontSize: "28px", margin: "10px 0", color: "#2c3e50" }}>{value}</p>
            )}
            {children && (
                <div style={{ margin: "10px 0" }}>
                    {children}
                </div>
            )}
            {footer && (
                <span style={{ color: "#7f8c8d", fontSize: "14px" }}>{footer}</span>
            )}
        </div>
    )
}

export default Card;