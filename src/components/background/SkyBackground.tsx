/**
 * Fixed, full-viewport watercolor sky. Soft sage pastel gradient with
 * gentle drifting washes — kept even and quiet on wide desktop screens.
 */
export function SkyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #EAF3F8 0%, #E3EBE6 34%, #DDE7DC 62%, #F8F6F2 100%)",
        }}
      />

      <div className="animate-drift-a absolute -top-16 left-[-8%] h-72 w-[70%] rounded-full opacity-55 blur-3xl [background:radial-gradient(closest-side,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
      <div className="animate-drift-b absolute top-24 right-[-10%] h-64 w-[55%] rounded-full opacity-40 blur-3xl [background:radial-gradient(closest-side,rgba(214,225,213,0.55),rgba(214,225,213,0))]" />
      <div className="animate-drift-a absolute bottom-[-12%] left-[15%] h-80 w-[60%] rounded-full opacity-30 blur-3xl [background:radial-gradient(closest-side,rgba(234,243,248,0.7),rgba(234,243,248,0))]" />

      <div className="paper-texture opacity-40" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, rgba(255,255,255,0) 50%, rgba(79,84,90,0.04) 100%)",
        }}
      />
    </div>
  );
}
