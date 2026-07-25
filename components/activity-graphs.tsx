"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import type {
  GithubActivity,
  HackatimeHeatmap,
} from "@/lib/activity";

type ActivityGraphsProps = {
  github: GithubActivity | null;
  hackatime: HackatimeHeatmap | null;
};

const periods = [
  { label: "last year", weeks: 53 },
  { label: "6 months", weeks: 26 },
  { label: "3 months", weeks: 13 },
  { label: "1 month", weeks: 5 },
  { label: "1 week", weeks: 1 },
] as const;

type Period = (typeof periods)[number];

export function ActivityGraphs({
  github,
  hackatime,
}: ActivityGraphsProps) {
  return (
    <aside className="utility-links" aria-label="Activity">
      <GithubGraph activity={github} />
      <HackatimeGraph activity={hackatime} />
    </aside>
  );
}

function GithubGraph({
  activity,
}: {
  activity: GithubActivity | null;
}) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const period: Period = periods[periodIndex];
  const cyclePeriod = () => {
    setPeriodIndex((current) => (current + 1) % periods.length);
  };
  const positioned = positionContributionDays(activity?.days ?? []);
  const maxWeek = Math.max(1, ...positioned.map((day) => day.week));
  const weekCount = Math.min(period.weeks, maxWeek);
  const firstWeek = maxWeek - weekCount + 1;
  const visibleDays = positioned
    .filter((day) => day.week >= firstWeek)
    .map((day) => ({ ...day, week: day.week - firstWeek + 1 }));
  const total = visibleDays.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="activity-card">
      <span className="activity-card__topline">
        <a href="https://github.com/ksgat">Github</a>
        <button
          className="activity-period"
          type="button"
          onClick={cyclePeriod}
          aria-label={`Showing ${period.label}. Click to change the GitHub activity range.`}
        >
          {activity ? `${total} contributions` : "@ksgat"} · {period.label}
        </button>
      </span>

      <a
        className="activity-card__graph-link"
        href="https://github.com/ksgat"
        aria-label="View ksgat on GitHub"
      >
        {activity ? (
          <span
            className="activity-heatmap"
            style={{ "--week-count": weekCount } as CSSProperties}
            aria-hidden="true"
          >
            {visibleDays.map((day) => (
              <span
                className={`activity-cell activity-cell--${day.level}`}
                key={day.date}
                style={{
                  gridColumn: day.week,
                  gridRow: day.weekday,
                }}
                title={`${day.count} contributions on ${day.date}`}
              />
            ))}
          </span>
        ) : (
          <span className="activity-card__fallback">Contribution graph</span>
        )}
      </a>
    </section>
  );
}

function HackatimeGraph({
  activity,
}: {
  activity: HackatimeHeatmap | null;
}) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const period: Period = periods[periodIndex];
  const cyclePeriod = () => {
    setPeriodIndex((current) => (current + 1) % periods.length);
  };
  const maxWeek = activity?.weekCount ?? 1;
  const weekCount = Math.min(period.weeks, maxWeek);
  const firstWeek = maxWeek - weekCount + 1;
  const visibleDays = (activity?.days ?? [])
    .filter((day) => day.week >= firstWeek)
    .map((day) => ({ ...day, week: day.week - firstWeek + 1 }));
  const totalSeconds = visibleDays.reduce(
    (sum, day) => sum + day.seconds,
    0,
  );

  return (
    <section className="activity-card activity-card--hackatime">
      <span className="activity-card__topline">
        <a href="https://hackatime.hackclub.com">Hackatime</a>
        <button
          className="activity-period"
          type="button"
          onClick={cyclePeriod}
          aria-label={`Showing ${period.label}. Click to change the Hackatime activity range.`}
        >
          {activity ? formatHours(totalSeconds) : "@ksgat"} · {period.label}
        </button>
      </span>

      <a
        className="activity-card__graph-link"
        href="https://hackatime.hackclub.com"
        aria-label="View ksgat on Hackatime"
      >
        {activity ? (
          <span
            className="activity-heatmap"
            style={{ "--week-count": weekCount } as CSSProperties}
            aria-hidden="true"
          >
            {visibleDays.map((day) => (
              <span
                className="activity-cell"
                key={`${day.week}-${day.weekday}-${day.label}`}
                style={{
                  backgroundColor: day.color,
                  gridColumn: day.week,
                  gridRow: day.weekday,
                }}
                title={day.label}
              />
            ))}
          </span>
        ) : (
          <span className="activity-card__fallback">Coding activity</span>
        )}
      </a>
    </section>
  );
}

function positionContributionDays(
  days: GithubActivity["days"],
): Array<GithubActivity["days"][number] & { week: number; weekday: number }> {
  if (days.length === 0) return [];

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(`${sorted[0].date}T00:00:00Z`);

  return sorted.map((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const elapsed = date.getTime() - first.getTime();

    return {
      ...day,
      week: Math.floor(elapsed / 604_800_000) + 1,
      weekday: date.getUTCDay() + 1,
    };
  });
}

function formatHours(seconds: number) {
  const hours = seconds / 3600;
  const value = hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);

  return `${value} hours`;
}
