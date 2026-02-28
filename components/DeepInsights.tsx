"use client";

import { useMemo } from "react";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type Entry = {
  text: string;
  moods: string[];
  title: string;
  createdAt: string;
};

type Entries = Record<string, Entry>;

type DeepInsightsProps = {
  entries: Entries;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DeepInsights({ entries }: DeepInsightsProps) {
  const insights = useMemo(() => {
    const entriesArray = Object.entries(entries);
    
    // day of week analysis
    const dayCount: Record<string, number> = {};
    DAYS.forEach((day) => (dayCount[day] = 0));
    
    // mood trends over time (last 30 days)
    const moodTrends: Record<string, number[]> = {};
    
    // word count analysis
    let totalWords = 0;
    let longestEntry = 0;
    let shortestEntry = Infinity;
    
    // time of day analysis
    const timeSlots = {
      morning: 0, // 5am-12pm
      afternoon: 0, // 12pm-5pm
      evening: 0, // 5pm-10pm
      night: 0, // 10pm-5am
    };
    
    entriesArray.forEach(([dateStr, entry]) => {
      const date = new Date(dateStr);
      const dayName = DAYS[date.getDay()];
      dayCount[dayName]++;
      
      // word count
      const words = entry.text.split(/\s+/).length;
      totalWords += words;
      longestEntry = Math.max(longestEntry, words);
      if (words > 0) shortestEntry = Math.min(shortestEntry, words);
      
      // time of day
      const hour = new Date(entry.createdAt).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
      
      // mood trends
      entry.moods.forEach((mood) => {
        if (!moodTrends[mood]) moodTrends[mood] = [];
        moodTrends[mood].push(date.getTime());
      });
    });
    
    const avgWords = entriesArray.length > 0 ? Math.round(totalWords / entriesArray.length) : 0;
    
    // find best writing day
    const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    
    // find favorite time
    const favoriteTime = Object.entries(timeSlots).sort((a, b) => b[1] - a[1])[0];
    
    // day chart data
    const dayChartData = DAYS.map((day) => ({
      day,
      entries: dayCount[day],
    }));
    
    return {
      avgWords,
      longestEntry,
      shortestEntry: shortestEntry === Infinity ? 0 : shortestEntry,
      bestDay: bestDay ? bestDay[0] : "N/A",
      bestDayCount: bestDay ? bestDay[1] : 0,
      favoriteTime: favoriteTime ? favoriteTime[0] : "N/A",
      favoriteTimeCount: favoriteTime ? favoriteTime[1] : 0,
      dayChartData,
      totalEntries: entriesArray.length,
    };
  }, [entries]);

  if (insights.totalEntries === 0) {
    return (
      <Card className="border-none bg-white/80 backdrop-blur">
        <CardBody className="text-center py-8">
          <p className="text-sm text-rose-500">
            start journaling to unlock deep insights about your patterns
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-none bg-white/80 backdrop-blur">
        <CardHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400">writing patterns</p>
            <p className="text-lg font-semibold text-rose-700">when you journal most</p>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.dayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecdd3" />
              <XAxis dataKey="day" stroke="#fb7185" />
              <YAxis stroke="#fb7185" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #fecdd3",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="entries" fill="#fb7185" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-rose-50/70 p-3">
              <p className="text-xs text-rose-500 mb-1">best day</p>
              <p className="text-lg font-semibold text-rose-700">{insights.bestDay}</p>
              <p className="text-xs text-rose-500">{insights.bestDayCount} entries</p>
            </div>
            <div className="rounded-xl bg-rose-50/70 p-3">
              <p className="text-xs text-rose-500 mb-1">favorite time</p>
              <p className="text-lg font-semibold text-rose-700">{insights.favoriteTime}</p>
              <p className="text-xs text-rose-500">{insights.favoriteTimeCount} entries</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-none bg-white/80 backdrop-blur">
        <CardHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400">writing style</p>
            <p className="text-lg font-semibold text-rose-700">your word patterns</p>
          </div>
        </CardHeader>
        <CardBody className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-rose-50/70 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{insights.avgWords}</p>
              <p className="text-xs text-rose-500">avg words</p>
            </div>
            <div className="rounded-xl bg-rose-50/70 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{insights.longestEntry}</p>
              <p className="text-xs text-rose-500">longest</p>
            </div>
            <div className="rounded-xl bg-rose-50/70 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{insights.shortestEntry}</p>
              <p className="text-xs text-rose-500">shortest</p>
            </div>
          </div>
          {insights.avgWords > 100 && (
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3">
              <p className="text-sm font-semibold text-rose-700 mb-1">✨ insight</p>
              <p className="text-sm text-rose-600">
                you write {insights.avgWords} words on average — that's more reflective than most people. longer entries often lead to deeper self-awareness.
              </p>
            </div>
          )}
          {insights.bestDayCount >= 3 && (
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3">
              <p className="text-sm font-semibold text-rose-700 mb-1">📊 pattern detected</p>
              <p className="text-sm text-rose-600">
                you journal most on {insights.bestDay}s. consider blocking time on that day — it's when you're most consistent.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
