import Page from "../Layouts/Page.jsx";
import { ArrowUpRightIcon, LinkIcon, MailIcon } from "../Icons.jsx";

function Contact() {
    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">04 — Écrivez-nous</p>
                <h1 className="vt-display vt-hero-title">Contact</h1>
                <p className="vt-lead">
                    Une question, une suggestion ou une remarque ? Écrivez-nous, nous vous répondrons avec plaisir.
                </p>
            </section>

            <div className="vt-grid-2">
                <a className="vt-link-card tone-peach" href="mailto:rishingsilvabryam@gmail.com">
                    <MailIcon size={32} />
                    <span className="vt-display vt-link-card-title">E-mail</span>
                    <span className="vt-link-card-text">rishingsilvabryam@gmail.com</span>
                    <ArrowUpRightIcon className="vt-link-card-arrow" size={28} />
                </a>
                <a
                    className="vt-link-card tone-lilac"
                    href="https://www.linkedin.com/in/bryam-rishing-silva-5a291b352"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <LinkIcon size={32} />
                    <span className="vt-display vt-link-card-title">LinkedIn</span>
                    <span className="vt-link-card-text">Bryam Rishing Silva<span className="vt-visually-hidden"> (nouvel onglet)</span></span>
                    <ArrowUpRightIcon className="vt-link-card-arrow" size={28} />
                </a>
            </div>
        </Page>
    );
}

export default Contact;
