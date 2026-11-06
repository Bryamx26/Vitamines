import React from 'react';

const Loading = () => {
    return (
        <div className="vt-loading" role="status">
            <div className="vt-loading-spinner" aria-hidden="true">
                <span className="tone-sky"></span>
                <span className="tone-leaf"></span>
                <span className="tone-rose"></span>
            </div>
            <p>Chargement…</p>
        </div>
    );
};

export default Loading;
