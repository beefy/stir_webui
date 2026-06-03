import { Link } from "react-router-dom";
import { useLocale } from "../contexts/LocaleContext";

export default function TermsOfService() {
  const { translations: tr } = useLocale();

  return (
    <div className="page" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link to="/" style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.9rem" }}>
        {tr.backToSignInLink}
      </Link>
      <h1 style={{ marginTop: "1rem" }}>{tr.termsTitle}</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        {tr.lastUpdated}
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsAcceptance}</h2>
        <p>{tr.termsAcceptanceText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsDescription}</h2>
        <p>{tr.termsDescriptionText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsConduct}</h2>
        <p>{tr.termsConductIntro}</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>{tr.termsConductHarass}</li>
          <li>{tr.termsConductSpam}</li>
          <li>{tr.termsConductImpersonate}</li>
          <li>{tr.termsConductViolate}</li>
          <li>{tr.termsConductIdentity}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsReporting}</h2>
        <p>{tr.termsReportingText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsRetention}</h2>
        <p>{tr.termsRetentionText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsTermination}</h2>
        <p>{tr.termsTerminationText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsDisclaimer}</h2>
        <p>{tr.termsDisclaimerText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsChanges}</h2>
        <p>{tr.termsChangesText}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>{tr.termsContact}</h2>
        <p>{tr.termsContactText}</p>
      </section>
    </div>
  );
}
