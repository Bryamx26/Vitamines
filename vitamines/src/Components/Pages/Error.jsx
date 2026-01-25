import { useNavigate } from "react-router-dom";

function Error() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ff4d4d, #ff9999)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          textAlign: "center",
          maxWidth: "420px",
          width: "90%",
        }}
      >
        <h1 style={{ marginBottom: "1rem", color: "#d32f2f" }}>
          Oups 😕
        </h1>

        <p style={{ marginBottom: "2rem", color: "#333" }}>
          La page que vous cherchez n’existe pas ou une erreur est survenue.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Recharger */}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.7rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#d32f2f",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Recharger
          </button>

          {/* Retour à l'accueil */}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "0.7rem 1.5rem",
              border: "2px solid #d32f2f",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "#d32f2f",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default Error;
