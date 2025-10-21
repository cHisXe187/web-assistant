export const dynamic = 'force-dynamic';
export default function EmbedAlive() {
  return (
    <div style={{
      fontFamily: "ui-sans-serif, system-ui",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#f9fafb",
      color: "#111827"
    }}>
      <h1 style={{fontSize: "1.25rem", margin: 0}}>💬 Web Assistant eingebettet</h1>
      <p style={{opacity:.8, marginTop: 8}}>Der Chat ist aktiv – bereit für WordPress iFrame.</p>
    </div>
  );
}
