// Formes décoratives (signature visuelle) : disques, pilules et bloc à pois.

function DotBlock({ className = "" }) {
    return (
        <span className={`vt-shape vt-shape-block ${className}`}>
            {Array.from({ length: 9 }, (_, i) => <i key={i}></i>)}
        </span>
    );
}

// Frise horizontale sous un titre
export function Frieze({ small = false }) {
    return (
        <div className={`vt-frieze${small ? " vt-frieze-small" : ""}`} aria-hidden="true">
            <span className="vt-shape vt-shape-disc tone-peach"></span>
            <span className="vt-shape vt-shape-pill tone-butter"></span>
            <DotBlock />
            <span className="vt-shape vt-shape-disc tone-sky"></span>
            <span className="vt-shape vt-shape-pill tone-lilac"></span>
            {!small && <span className="vt-shape vt-shape-disc tone-rose"></span>}
            {!small && <span className="vt-shape vt-shape-pill tone-leaf"></span>}
        </div>
    );
}

// Composition en position absolue autour d'une carte centrée (connexion)
export function Scatter() {
    return (
        <div className="vt-scatter" aria-hidden="true">
            <span className="vt-shape vt-shape-disc tone-peach vt-scatter-1"></span>
            <span className="vt-shape vt-shape-pill tone-butter vt-scatter-2"></span>
            <DotBlock className="vt-scatter-3" />
            <span className="vt-shape vt-shape-disc tone-sky vt-scatter-4"></span>
            <span className="vt-shape vt-shape-pill tone-lilac vt-scatter-5"></span>
            <span className="vt-shape vt-shape-disc tone-rose vt-scatter-6"></span>
        </div>
    );
}
