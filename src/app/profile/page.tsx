"use client";

export default function ProfilePage() {
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
        Profil
      </h1>

      <div
        style={{
          backgroundColor: "#141416",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          Profilinformationen
        </h2>

        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
          Hier kannst du deine persönlichen Daten, dein Profilbild und deine
          Bio anpassen. Später fügen wir hier auch Social Links und weitere
          Optionen hinzu.
        </p>
      </div>
    </div>
  );
}
