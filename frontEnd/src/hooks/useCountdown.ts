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
    const d = typeof target === "string" ? new Date(target) : target;
    if (Number.isNaN(d?.getTime?.())) return null;
    return d;
  }, [target]);

  const initial = {
    isValid: false,
    diff: 0,
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDate) return initial;
    return { ...calcTimeLeft(targetDate), isValid: true };
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(initial);
      return;
    }

    // Client-safe interval (avoids SSR window usage)
    setTimeLeft({ ...calcTimeLeft(targetDate), isValid: true });

    const intervalId = window.setInterval(() => {
      setTimeLeft({ ...calcTimeLeft(targetDate), isValid: true });
    }, 1000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate?.getTime?.()]);

  return timeLeft;
}

