import React, { useContext } from 'react';
import { ThemeContext } from "../context/ThemeContext.jsx";

const Loading = () => {

    const { isDark } = useContext(ThemeContext);
    return (

        <div style={{
            backgroundColor: isDark ? "#000000" : "rgba(136,101,230,0)",
            width: "100%",
            height: "100vh",
        }}>
            <div style={styles.container}>
                {isDark && (
                    <>
                        <div
                            className="vitamineTitleBacground"
                            style={{ position: "fixed", zIndex: 0 }}
                        ></div>
                        <div
                            className="vitamineTitleBacground2"
                            style={{ position: "fixed", zIndex: 0 }}
                        ></div>
                    </>
                )}

                <div style={styles.spinnerContainer}>
                    {/* Boule 1 */}
                    <div
                        className="ball-1"
                        style={{
                            ...styles.ball,
                            backgroundColor: '#93C5FD'
                        }}
                    />

                    {/* Boule 2 */}
                    <div
                        className="ball-2"
                        style={{
                            ...styles.ball,
                            backgroundColor: '#86EFAC'
                        }}
                    />

                    {/* Boule 3 */}
                    <div
                        className="ball-3"
                        style={{
                            ...styles.ball,
                            backgroundColor: '#F9A8D4'
                        }}
                    />
                </div>

                {/* Texte de chargement */}
                <div style={styles.textContainer}>
                    <p style={styles.text}>Chargement...</p>
                </div>

                {/* Styles CSS pour l'animation */}
                <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .ball-1 {
          animation: spin 1.2s linear infinite;
        }
        
        .ball-2 {
          animation: spin 1.2s linear infinite;
          animation-delay: -0.4s;
        }
        
        .ball-3 {
          animation: spin 1.2s linear infinite;
          animation-delay: -0.8s;
        }
      `}</style>
            </div>
        </div>
    );
};

const styles = {

    container: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        top: "500px",
        width: "100%",

    },
    spinnerContainer: {
        position: 'relative',
        width: '64px',
        height: '64px',

    },
    ball: {
        position: 'absolute',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        top: '2px',
        left: '50%',
        marginLeft: '-8px',
        transformOrigin: '8px 30px'
    },
    textContainer: {
        marginTop: '32px'
    },
    text: {
        color: '#ebeced',
        fontSize: '18px',
        fontWeight: '500',
        margin: '0'
    }
};

export default Loading;