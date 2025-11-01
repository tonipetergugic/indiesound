"use client";

export default function SettingsPage() {
  return (
    <div
      style={{
        maxWidth: "800px",
        width: "100%",
        margin: "0 auto",
        paddingTop: "40px",
        color: "var(--text-primary)",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "30px",
          color: "var(--text-primary)",
        }}
      >
        Einstellungen
      </h1>

      <div
        style={{
          backgroundColor: "#141416",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
        }}
      >
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
          Hier kannst du später App-Einstellungen, Sprache oder Designmodus anpassen.
        </p>
      </div>
    </div>
  );
}

