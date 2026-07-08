/**
 * Fixed, full-viewport watercolor sky. Sits behind every screen so the app
 * always feels like an open journal page rather than a UI shell — soft
 * gradient sky, two slow-drifting cloud washes, paper grain, and an
 * almost imperceptible vignette.
 */
export function SkyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #EAF3F8 0%, #EEF6FB 34%, #FCFBF8 70%, #F8F6F2 100%)",
        }}
      />

      <div className="animate-drift-a absolute -top-10 left-[-10%] h-64 w-[80%] rounded-full opacity-70 blur-2xl [background:radial-gradient(closest-side,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />
      <div className="animate-drift-b absolute top-16 right-[-15%] h-56 w-[70%] rounded-full opacity-60 blur-2xl [background:radial-gradient(closest-side,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
      <div className="animate-drift-a absolute top-1/3 left-[-20%] h-72 w-[90%] rounded-full opacity-40 blur-3xl [background:radial-gradient(closest-side,rgba(220,214,232,0.5),rgba(220,214,232,0))]" />

      <div className="paper-texture" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, rgba(255,255,255,0) 45%, rgba(79,84,90,0.05) 100%)",
        }}
      />
    </div>
  );
}
