"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";

import type { GithubActivity, HackatimeHeatmap } from "@/lib/activity";

import { ActivityShader } from "./activity-shader";
import styles from "./activity-graphs.module.css";

type ActivityGraphsProps = {
  github: GithubActivity | null;
  hackatime: HackatimeHeatmap | null;
};

const ACTIVITY_PERIODS = [
  { label: "last year", days: 371 },
  { label: "6 months", days: 182 },
  { label: "3 months", days: 91 },
  { label: "1 month", days: 35 },
  { label: "1 week", days: 7 },
] as const;

export function ActivityGraphs({ github, hackatime }: ActivityGraphsProps) {
  return (
    <aside className={styles.grid} aria-label="Activity">
      <HackatimeGraph activity={hackatime} />
      <GithubGraph activity={github} />
    </aside>
  );
}

function GithubGraph({ activity }: { activity: GithubActivity | null }) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = ACTIVITY_PERIODS[periodIndex];
  const visibleDays = useMemo(
    () =>
      [...(activity?.days ?? [])]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-period.days),
    [activity, period.days],
  );
  const total = visibleDays.reduce((sum, day) => sum + day.count, 0);

  return (
    <ActivityCard
      title="GitHub"
      href="https://github.com/ksgat"
      periodLabel={period.label}
      summary={activity ? `${total} contributions` : "@ksgat"}
      onCyclePeriod={() => cyclePeriod(setPeriodIndex)}
    >
      <ActivityShader
        values={visibleDays.map((day) => day.count)}
        label={`GitHub contribution grid for ${period.label}`}
      />
    </ActivityCard>
  );
}

function HackatimeGraph({ activity }: { activity: HackatimeHeatmap | null }) {
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = ACTIVITY_PERIODS[periodIndex];
  const visibleDays = useMemo(
    () =>
      [...(activity?.days ?? [])]
        .sort((a, b) => a.week - b.week || a.weekday - b.weekday)
        .slice(-period.days),
    [activity, period.days],
  );
  const totalSeconds = visibleDays.reduce((sum, day) => sum + day.seconds, 0);

  return (
    <ActivityCard
      title="Hackatime"
      href="https://hackatime.hackclub.com"
      periodLabel={period.label}
      summary={activity ? formatHours(totalSeconds) : "@ksgat"}
      onCyclePeriod={() => cyclePeriod(setPeriodIndex)}
    >
      <ActivityShader
        values={visibleDays.map((day) => day.seconds)}
        label={`Hackatime coding activity grid for ${period.label}`}
      />
    </ActivityCard>
  );
}

type ActivityCardProps = {
  children: ReactNode;
  href: string;
  onCyclePeriod: () => void;
  periodLabel: string;
  summary: string;
  title: string;
};

function ActivityCard({
  children,
  href,
  onCyclePeriod,
  periodLabel,
  summary,
  title,
}: ActivityCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2>
          <a href={href}>{title}</a>
        </h2>
        <button
          className={styles.period}
          type="button"
          onClick={onCyclePeriod}
          aria-label={`Showing ${periodLabel}. Change the ${title} activity range.`}
        >
          {summary} · {periodLabel}
        </button>
      </header>
      <a
        className={styles.shaderLink}
        href={href}
        aria-label={`View ksgat on ${title}`}
      >
        {children}
      </a>
    </section>
  );
}

function cyclePeriod(setPeriodIndex: Dispatch<SetStateAction<number>>) {
  setPeriodIndex((current) => (current + 1) % ACTIVITY_PERIODS.length);
}

function formatHours(seconds: number) {
  const hours = seconds / 3600;
  const value = hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);

  return `${value} hours`;
}
