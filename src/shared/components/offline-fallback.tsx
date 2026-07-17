export function OfflineFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-heading text-2xl font-semibold text-foreground">You are offline</p>
      <p className="text-muted-foreground">Check your connection and try again.</p>
    </div>
  );
}
