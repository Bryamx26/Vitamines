import { useState } from "react";
import AlimentsModal from "../Aliments/AlimentsModal.jsx";
import { PlusIcon } from "../Icons.jsx";

function AddAlimentBubble() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="vt-food-add"
                onClick={() => setOpen(true)}
                aria-label="Ajouter un aliment"
            >
                <PlusIcon size={28} />
            </button>

            <AlimentsModal open={open} setOpen={setOpen} />
        </>
    );
}

export default AddAlimentBubble;
