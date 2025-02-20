// hooks/useAnalytics.ts
'use client'

interface EventProps {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

export const useAnalytics = () => {
  const event = ({ action, category, label, value }: EventProps) => {
    const win = window as typeof window & {
      gtag: (
        command: 'event' | 'config' | 'js',
        targetId: string,
        options?: {
          event_category?: string;
          event_label?: string;
          value?: number;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key: string]: any;
        }
      ) => void;
    };

    win.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  return { event };
};