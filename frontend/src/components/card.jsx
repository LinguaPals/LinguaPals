const Card = ({ title, children, footer }) => {
    return (
        <div className="card">
            <div className="card-title">
                <h2>{title}</h2>
            </div>
            <div className="card-content">
                {children}
            </div>
            <div className="card-footer">
                {footer && (
                    <span style={{ color: "#7f8c8d", fontSize: "14px" }}>{footer}</span>
                )}
            </div>
        </div>
    )
}

export default Card;