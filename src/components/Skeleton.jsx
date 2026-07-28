export function Skeleton({ width, height, style }) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: width || '100%',
        height: height || 16,
        borderRadius: 6,
        background: 'linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="anchor-card" style={{ padding: '1.5rem' }}>
      <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <Skeleton width="30%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={40} />
        </div>
      ))}
      <Skeleton width="100%" height={48} style={{ marginTop: 8 }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ width: '100%' }}>
      <Skeleton width="100%" height={36} style={{ marginBottom: 8 }} />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} width="100%" height={40} style={{ marginBottom: 4 }} />
      ))}
    </div>
  )
}
