export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "-";

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

