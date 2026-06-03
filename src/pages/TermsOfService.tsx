import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="page" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link to="/" style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.9rem" }}>
        &larr; Back to Sign In
      </Link>
      <h1 style={{ marginTop: "1rem" }}>Terms of Service</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Last updated: June 3, 2026
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Acceptance of Terms</h2>
        <p>
          By creating an account and using this service, you agree to these Terms of Service. If
          you do not agree, do not use the service.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Description of Service</h2>
        <p>
          This service allows users to send anonymous messages to random other users. Messages are
          delivered to a randomly selected recipient. The identity of senders and recipients is
          never revealed.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>User Conduct</h2>
        <p>You agree not to use this service to:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>Harass, threaten, or abuse other users.</li>
          <li>Send spam, unsolicited promotional content, or advertisements.</li>
          <li>Impersonate any person or entity.</li>
          <li>Violate any applicable laws or regulations.</li>
          <li>Attempt to discover the identity of other users.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Reporting and Blocking</h2>
        <p>
          Users can report messages and block other users. Reported messages may be reviewed, and
          users who violate these terms may have their accounts terminated.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Content Retention</h2>
        <p>
          Any content you send as a message will be delivered to a random other user. Messages are
          retained until either you or the recipient deletes your account. You can delete your
          account and all associated data at any time from the Settings page.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Account Termination</h2>
        <p>
          You may delete your account at any time from the Settings page. We reserve the right to
          terminate or suspend accounts that violate these terms.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Disclaimer</h2>
        <p>
          This service is provided "as is" without warranties of any kind. We are not responsible
          for the content of messages sent through the service.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the service after changes
          constitutes acceptance of the new terms.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Contact</h2>
        <p>
          If you have any questions about these terms, please contact us through the project's
          GitHub repository.
        </p>
      </section>
    </div>
  );
}
