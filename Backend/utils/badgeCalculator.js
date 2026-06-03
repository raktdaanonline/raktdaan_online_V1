export function calculateBadge(totalDonations) {
  if (totalDonations >= 50) return 'hero';
  if (totalDonations >= 20) return 'platinum';
  if (totalDonations >= 10) return 'gold';
  if (totalDonations >= 3)  return 'silver';
  return 'new';
}

export function getNextEligibleDate(lastDonationDate) {
  const next = new Date(lastDonationDate);
  next.setDate(next.getDate() + 90);  // 3 months = 90 days
  return next;
}
