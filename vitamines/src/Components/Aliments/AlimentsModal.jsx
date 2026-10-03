import UploadFiles from "./UploadFiles.jsx";
import AllAlimentFrame from "./AllAlimentFrame.jsx";
import { CloseIcon } from "../Icons.jsx";

function AlimentsModal({open, setOpen }) {

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

                <AllAlimentFrame/>

                <UploadFiles/>
            </div>
        </div>
    );
}

export default AlimentsModal;
