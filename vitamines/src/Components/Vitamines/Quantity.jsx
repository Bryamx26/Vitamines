function Quantity({quantity}) {


    return (
        <div className="vt-qty">
            <span className="vt-qty-unit">mg / jour</span>
            <span className="vt-qty-value">{quantity}</span>
        </div>
    )

}


export default Quantity;
