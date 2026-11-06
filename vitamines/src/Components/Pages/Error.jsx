import { useNavigate } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import { AlertIcon } from "../Icons.jsx";

function Error() {
  const navigate = useNavigate();

  return (
    <Page>
      <div className="vt-auth-stage">
        <div className="vt-auth">
          <span className="vt-auth-icon"><AlertIcon size={32} /></span>
          <h1 className="vt-display vt-title">Page introuvable</h1>
          <p>Cette page n'existe pas ou n'a pas pu être chargée. Rechargez la page ou revenez à l'accueil.</p>
          <div className="vt-actions">
            <button type="button" className="vt-btn-primary" onClick={() => navigate("/")}>
              Retour à l'accueil
            </button>
            <button type="button" className="vt-btn-ghost" onClick={() => window.location.reload()}>
              Recharger
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default Error;
