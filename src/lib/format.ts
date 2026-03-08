export function formatINR(crores: number): string {
  if (crores === 0) return '₹0';
  if (crores >= 1) return `₹${crores.toFixed(2)} Crore`;
  return `₹${(crores * 100).toFixed(2)} Lakh`;
}

export function getScoreColor(score: number): string {
  if (score > 70) return 'text-cam-success';
  if (score >= 40) return 'text-cam-warning';
  return 'text-cam-danger';
}

export function getScoreBarColor(score: number): string {
  if (score > 70) return 'hsl(160, 84%, 39%)';
  if (score >= 40) return 'hsl(32, 95%, 44%)';
  return 'hsl(0, 72%, 51%)';
}
