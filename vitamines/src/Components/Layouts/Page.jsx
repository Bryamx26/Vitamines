import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

// Conteneur commun : en-tête, contenu centré (max 1200px), pied de page.
// `tinted` + `tone` : la page entière prend la couleur d'accent (fiche vitamine).
function Page({ children, tone, tinted = false, className = "" }) {
    const classes = ["vt-page", tinted && "vt-tinted", tone && `tone-${tone}`, className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes}>
            <div className="vt-container">
                <Header />
                <main className="vt-main">{children}</main>
                <Footer />
            </div>
        </div>
    );
}

export default Page;
