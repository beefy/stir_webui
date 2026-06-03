import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="page" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link to="/" style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.9rem" }}>
        &larr; Back to Sign In
      </Link>
      <h1 style={{ marginTop: "1rem" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Last updated: June 3, 2026
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Information We Collect</h2>
        <p>
          We collect only the information necessary to provide our anonymous messaging service:
        </p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>
            <strong>Account Information:</strong> When you create an account, we collect your email
            address and a password (stored securely by Firebase Authentication). This is used solely
            for authentication purposes.
          </li>
          <li>
            <strong>Message Content:</strong> Any content you send as a message is stored and
            delivered to a random anonymous user. Messages are retained until either you or the
            recipient deletes your account.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>How We Use Your Information</h2>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>To authenticate you and provide access to your account.</li>
          <li>To deliver messages you send to random anonymous recipients.</li>
          <li>To display your message history and allow you to manage your messages.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Data Deletion</h2>
        <p>
          You can delete your account and all associated data at any time from the Settings page.
          This will permanently remove your account information, all messages you have sent, and
          all messages you have received. This action cannot be undone.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Data Sharing</h2>
        <p>
          We do not sell, trade, or share your personal information with third parties. Your
          messages are delivered anonymously to random users of the service — your identity is
          never revealed to recipients.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Third-Party Services</h2>
        <p>
          We use Firebase (Google) for authentication. Firebase's privacy policy can be found at{" "}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
            firebase.google.com/support/privacy
          </a>.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Contact</h2>
        <p>
          If you have any questions about this privacy policy, please contact us through the
          project's GitHub repository.
        </p>
      </section>
    </div>
  );
}
