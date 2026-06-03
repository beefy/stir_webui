import { Link } from "react-router-dom";
import { useLocale } from "../contexts/LocaleContext";

export default function PrivacyPolicy() {
  const { translations: tr } = useLocale();

  return (
    <div className="page" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link to="/" style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.9rem" }}>
        {tr.backToSignInLink}
      </Link>
      <h1 style={{ marginTop: "1rem" }}>{tr.privacyTitle}</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        {tr.lastUpdated}
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyInfoWeCollect}</h2>
        <p>{tr.privacyInfoWeCollectText}</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li><strong>{tr.privacyAccountInfo.split(":")[0]}:</strong>{tr.privacyAccountInfo.split(":")[1]}</li>
          <li><strong>{tr.privacyMessageContent.split(":")[0]}:</strong>{tr.privacyMessageContent.split(":")[1]}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyHowWeUse}</h2>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>{tr.privacyUseAuth}</li>
          <li>{tr.privacyUseDeliver}</li>
          <li>{tr.privacyUseDisplay}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyDataDeletion}</h2>
        <p>{tr.privacyDataDeletionText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyDataSharing}</h2>
        <p>{tr.privacyDataSharingText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyThirdParty}</h2>
        <p>
          {tr.privacyThirdPartyText}{" "}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
            firebase.google.com/support/privacy
          </a>.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.privacyContact}</h2>
        <p>{tr.privacyContactText}</p>
      </section>
    </div>
  );
}
