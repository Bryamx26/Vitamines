import Header from "../Layouts/Header.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useContext } from "react";

function Contact() {
    const { isDark } = useContext(ThemeContext);

    return (
        <>
            <Header />
            <main
                id="MainPage"
                style={{
                    position: "relative", // Pour que les enfants absolute soient positionnés par rapport à main
                    backgroundColor: isDark ? "black" : "#8865E6",
                    transition: "all 0.5s ease-in",
                    minHeight: "100vh",
                    color: isDark ? "white" : "#f5f5f5",
                }}
            >
                {isDark && (
                    <>
                        <div
                            className="vitamineTitleBacground"
                            style={{ position: "absolute", zIndex: 0 }}
                        ></div>
                        <div
                            className="vitamineTitleBacground2"
                            style={{ position: "absolute", zIndex: 0 }}
                        ></div>
                    </>
                )}

                <div className="Title">
                    <p>Contact</p>
                </div>

                <div
                    style={{
                        maxWidth: "600px",
                        margin: "0 auto",
                        fontSize: "1.1rem",
                        lineHeight: "1.7",
                    }}
                >
                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ color: "#2196F3" }}>Nous contacter</h2>
                        <p>
                            Vous avez une question, une suggestion ou une remarque ? N'hésitez
                            pas à nous écrire !
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h3 style={{ color: "#4CAF50" }}>📧 Email</h3>
                        <p>
                            <a
                                href="mailto:rishingsilvabryam@gmail.com"
                                style={{
                                    color: isDark ? "#3180bf" : "#00b2ff",
                                    textDecoration: "underline",
                                    position: "relative", // Pour que zIndex fonctionne si besoin
                                    zIndex: 2,
                                }}
                            >
                                rishingsilvabryam@gmail.com
                            </a>
                        </p>
                    </section>

                    <section
                        style={{
                            position: "relative", // Nécessaire pour que zIndex fonctionne
                            zIndex: 4,
                            marginBottom: "2rem",
                        }}
                    >
                        <h3 style={{ color: "#0095ff" }}>🔗 LinkedIn</h3>
                        <a
                            href="https://www.linkedin.com/in/bryam-rishing-silva-5a291b352"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: isDark ? "#5684a8" : "#00a1ff",
                                textDecoration: "underline",
                                position: "relative", // idem
                                zIndex: 4,
                            }}
                        >
                            Mon LinkedIn
                        </a>
                    </section>
                </div>
            </main>
        </>
    );
}

export default Contact;
