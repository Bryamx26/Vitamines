import UploadFiles from "./UploadFiles.jsx";
import AllAlimentFrame from "./AllAlimentFrame.jsx";

function AlimentsModal({open, setOpen }) {

    if (!open) return ("")

    const toggle = () => {
        setOpen(prev => !prev);
    }

    return (
        <div className="AlimentsModalContainer">

            <img className=" modal-button" src={"/images/close.svg"}  alt="close" onClick={toggle}/>

            <div  className="modal-top">

                    <AllAlimentFrame/>


            </div>

            <div className="modal-bottom">
                <div className="modal-upload-div" >
                    <UploadFiles/>
                </div>

            </div>



        </div>
    );
}

export default AlimentsModal;
