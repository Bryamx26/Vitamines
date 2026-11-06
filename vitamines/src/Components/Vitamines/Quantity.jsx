// « mg/j » → « mg / jour », « µg ER/j » → « µg ER / jour »
export function uniteLisible(unite) {
    if (!unite) return "mg / jour";
    return unite.replace(/\s*\/\s*j$/, " / jour");
}

function Quantity({ quantity, unite }) {
    return (
        <div className="vt-qty">
            <span className="vt-qty-unit">{uniteLisible(unite)}</span>
            <span className="vt-qty-value">{quantity}</span>
        </div>
    )
}

export default Quantity;
