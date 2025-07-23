import Header from "../Layouts/Header.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useContext } from "react";

function About() {
    const { isDark } = useContext(ThemeContext);

    return (
        <>
            <Header />
            <main
                id="MainPage"
                style={{
                    backgroundColor: isDark ? "black" : "#8865e6",
                    transition: "all 0.5s ease-in",
                    minHeight: "100vh",

                    color: isDark ? "white" : "#f5f5f5",
                }}
            >
                {isDark && (
                    <>
                        <div className="vitamineTitleBacground"></div>
                        <div className="vitamineTitleBacground2"></div>
                    </>
                )}

                <div className="Title">
                    <p>À propos</p>
                </div>

                <div style={{ maxWidth: "800px", margin: "0 auto", fontSize: "1.1rem", lineHeight: "1.7" }}>
                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ color: "#2196F3" }}>Un projet étudiant</h2>
                        <p>
                            Ce site a été conçu <strong>par des étudiants, pour des étudiants</strong>. Il a pour but
                            d’aider à comprendre facilement le rôle des vitamines dans notre corps, et à apprendre en
                            s’amusant.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ color: "#4CAF50" }}>Notre objectif</h2>
                        <p>
                            Nous souhaitons fournir un contenu clair, visuel et accessible à tous. Vous pouvez découvrir
                            les différentes vitamines, leurs bienfaits, leurs effets en cas de carence ou d'excès, et
                            bientôt, tester vos connaissances via des quizz.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ color: "#FF9800" }}>Un apprentissage agréable</h2>
                        <p>
                            Apprendre ne devrait jamais être ennuyeux. C’est pourquoi notre interface est pensée pour
                            être agréable, ludique et motivante.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: "#b61283" }}>Contact et suggestions</h2>
                        <p>
                            Ce site est en constante évolution. Si vous avez des suggestions ou des idées
                            d’amélioration, n’hésitez pas à nous contacter via le formulaire dédié. Merci de faire
                            partie de cette aventure !
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}

export default About;
