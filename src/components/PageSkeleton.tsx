/** Placeholder with roughly the final layout's heights, shown while a page chunk loads. */
export function PageSkeleton() {
  return (
    <div className="wrap" style={{ padding: '44px 0' }} aria-busy="true" aria-label="Loading page">
      <div className="skel" style={{ width: 140, height: 14 }} />
      <div className="skel" style={{ width: '62%', height: 44, marginTop: 16 }} />
      <div className="skel" style={{ width: '48%', height: 18, marginTop: 14 }} />
      <div className="skel" style={{ width: '100%', height: 420, marginTop: 34, borderRadius: 14 }} />
    </div>
  );
}
