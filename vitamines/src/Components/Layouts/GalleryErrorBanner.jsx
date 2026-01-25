

function GalleryErrorBanner({
  message = "Impossible de charger les éléments.",
}) {


  return (
    <div
      style={{
        gridColumn: "1 / -1", // prend toute la largeur de la galerie
        padding: "1.5rem",
        borderRadius: "10px",
        backgroundColor: "#fddb55",
        border: "1px solid #ffe100",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        color: "#4d4747"
      }}
    >
      <strong style={{ fontSize: "1.1rem" }}>
        ⚠️ Erreur de chargement
      </strong>

      <p style={{ margin: 0, textAlign: "center" }}>
        {message}
      </p>

        <div style={{ display: "flex", gap: "1rem" }}>
      </div>
    </div>
  );
}

export default GalleryErrorBanner;
