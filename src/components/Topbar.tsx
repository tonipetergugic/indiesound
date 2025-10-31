"use client";

export default function Topbar() {
  return (
    <header
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#141416",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 20px",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      <div
        style={{
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
        }}
      />
    </header>
  );
}
