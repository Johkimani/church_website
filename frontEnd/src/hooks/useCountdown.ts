import { useEffect, useMemo, useState } from "react";

const calcTimeLeft = (targetDate: Date) => {
  const diff = targetDate.getTime() - Date.now();
  const total = Math.max(0, diff);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { diff, total, days, hours, minutes, seconds };
};

export default function useCountdown(target: string | Date | null | undefined) {
  const targetDate = useMemo(() => {
    if (!target) return null;
    return typeof target === "string" ? new Date(target) : target;
  }, [target]);

  const [timeLeft, setTimeLeft] = useState(() =>
    targetDate ? calcTimeLeft(targetDate) : { diff: 0, total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (!targetDate || Number.isNaN(targetDate.getTime())) return;

    setTimeLeft(calcTimeLeft(targetDate));

    const interval = window.setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

