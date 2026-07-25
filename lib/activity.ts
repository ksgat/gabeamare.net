export type ContributionDay = {
  date: string;
  level: number;
  count: number;
};

export type GithubActivity = {
  days: ContributionDay[];
  total: number;
};

export type HackatimeDay = {
  week: number;
  weekday: number;
  seconds: number;
  color: string;
  label: string;
};

export type HackatimeHeatmap = {
  days: HackatimeDay[];
  weekCount: number;
};

export async function getGithubActivity(
  username: string,
): Promise<GithubActivity | null> {
  try {
    const response = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      {
        headers: {
          Accept: "text/html",
          "User-Agent": "gabeamare.net",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return null;

    const html = await response.text();
    const days: ContributionDay[] = [];
    const dayPattern = /data-date="([^"]+)"[^>]*data-level="([0-4])"/g;
    const counts = Array.from(
      html.matchAll(
        /class="sr-only position-absolute">(?:(\d+) contributions?|No contributions) on/g,
      ),
      (match) => Number(match[1] ?? 0),
    );

    let index = 0;
    for (const match of html.matchAll(dayPattern)) {
      days.push({
        date: match[1],
        level: Number(match[2]),
        count: counts[index] ?? 0,
      });
      index += 1;
    }

    if (days.length === 0) return null;

    const total = counts.reduce((sum, count) => sum + count, 0);

    return { days, total };
  } catch {
    return null;
  }
}

export async function getHackatimeHeatmap(
  username: string,
): Promise<HackatimeHeatmap | null> {
  try {
    const response = await fetch(
      `https://heatmap.shymike.dev?id=${encodeURIComponent(username)}`,
      {
        headers: {
          Accept: "image/svg+xml",
          "User-Agent": "gabeamare.net",
        },
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) return null;

    const svg = await response.text();
    const days: HackatimeDay[] = [];
    const cellPattern =
      /<rect fill="([^"]+)"[^>]*x="(\d+)" y="(\d+)">\s*<title>([^<]+)<\/title>\s*<\/rect>/g;

    for (const match of svg.matchAll(cellPattern)) {
      days.push({
        color: match[1],
        week: Math.floor(Number(match[2]) / 13) + 1,
        weekday: Math.floor(Number(match[3]) / 13) + 1,
        seconds: parseDuration(match[4]),
        label: match[4],
      });
    }

    if (days.length === 0) return null;

    return {
      days,
      weekCount: Math.max(...days.map((day) => day.week)),
    };
  } catch {
    return null;
  }
}

function parseDuration(label: string) {
  if (label.startsWith("No activity")) return 0;

  const hours = Number(label.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(label.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(label.match(/(\d+)s/)?.[1] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}
