import { useState } from "react";
import AlimentsModal from "../Aliments/AlimentsModal.jsx";

function AddAlimentBubble() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="bubble-button"
                onClick={() => setOpen(true)}
                aria-label="Ajouter un aliment"
            >
                <img
                    src="/images/add.svg"
                    alt=""
                    style={{ width: "30px", height: "30px" }}
                />
            </button>

            <AlimentsModal open={open} setOpen={setOpen} />
        </>
    );
}

export default AddAlimentBubble;
