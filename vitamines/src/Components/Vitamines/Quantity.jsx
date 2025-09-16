function Quantity({quantity}) {


    return (
        <div className="vitamineQuantity-container">
            <span className="vitamineQuantityText">mg/J</span>
            <span className="vitamineQuantitySpan">{quantity} </span>
        </div>
    )

}


export default Quantity;