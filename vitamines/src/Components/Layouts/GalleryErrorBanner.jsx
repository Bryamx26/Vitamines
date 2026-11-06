import { AlertIcon } from "../Icons.jsx";

function GalleryErrorBanner({
  message = "Impossible de charger les éléments. Vérifiez votre connexion puis rechargez la page.",
}) {

  return (
    <div className="vt-banner vt-banner-danger" role="alert">
      <AlertIcon size={22} />
      <div>
        <strong className="vt-banner-title">Erreur de chargement</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default GalleryErrorBanner;
