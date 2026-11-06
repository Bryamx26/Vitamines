import UploadFiles from "./UploadFiles.jsx";
import AllAlimentFrame from "./AllAlimentFrame.jsx";
import { useState } from "react";
import { CloseIcon } from "../Icons.jsx";

function AlimentsModal({open, setOpen }) {
    // Incrémenté après chaque ajout pour recharger la liste des aliments
    const [version, setVersion] = useState(0);

    if (!open) return ("")

    const toggle = () => {
        setOpen(prev => !prev);
    }

    return (
        <div className="vt-modal-backdrop">
            <div className="vt-modal" role="dialog" aria-modal="true" aria-labelledby="aliments-modal-title">
                <button type="button" className="vt-modal-close" onClick={toggle} aria-label="Fermer">
                    <CloseIcon size={20} />
                </button>

                <h2 id="aliments-modal-title" className="vt-display vt-title">Aliments</h2>

                <AllAlimentFrame version={version}/>

                <UploadFiles onUpload={() => setVersion((v) => v + 1)}/>
            </div>
        </div>
    );
}

export default AlimentsModal;
