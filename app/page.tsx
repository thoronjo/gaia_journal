"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Spacer,
  Textarea,
} from "@heroui/react";
import { motion } from "framer-motion";
import KoalaMascot from "@/components/KoalaMascot";

const MOODS = [
  { key: "soft", label: "Soft", color: "bg-pink-100 text-pink-700" },
  { key: "glow", label: "Glow", color: "bg-rose-100 text-rose-700" },
  { key: "calm", label: "Calm", color: "bg-fuchsia-100 text-fuchsia-700" },
  { key: "brave", label: "Brave", color: "bg-pink-200 text-pink-800" },
  { key: "dreamy", label: "Dreamy", color: "bg-rose-200 text-rose-800" },
  { key: "bold", label: "Bold", color: "bg-fuchsia-200 text-fuchsia-800" },
];

const REWARD_VIDEOS = [
  {
    id: "J---aiyznGQ",
    label: "tiny kitten zoomies",
    vibe: "cats",
  },
  {
    id: "hY7m5jjJ9mM",
    label: "cats being dramatic",
    vibe: "cats",
  },
  {
    id: "3GwjfUFyY6M",
    label: "feel-good mood boost",
    vibe: "cheerful",
  },
  {
    id: "KxGRhd_iWuE",
    label: "random giggle break",
    vibe: "funny",
  },
];

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const countSentences = (text: string) => {
  return text
    .split(/[.!?]+/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean).length;
};

const getMonthDays = (month: Date) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  return cells;
};

type Entry = {
  text: string;
  moods: string[];
  title: string;
  createdAt: string;
};

type Entries = Record<string, Entry>;

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [entries, setEntries] = useState<Entries>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("gaia-entries");
    if (!stored) return {};
    try {
      return JSON.parse(stored) as Entries;
    } catch {
      return {};
    }
  });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draftTitle, setDraftTitle] = useState(
    entries[selectedDate]?.title ?? ""
  );
  const [draftText, setDraftText] = useState(entries[selectedDate]?.text ?? "");
  const [draftMoods, setDraftMoods] = useState<string[]>(
    entries[selectedDate]?.moods ?? []
  );
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewardVideo, setRewardVideo] = useState<(typeof REWARD_VIDEOS)[0] | null>(
    null
  );
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("gaia-entries", JSON.stringify(entries));
  }, [entries]);

  const monthCells = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const todayStr = formatDate(new Date());

  const totalEntries = Object.keys(entries).length;
  const points = totalEntries * 12;
  const level = Math.max(1, Math.floor(points / 60) + 1);
  const levelProgress = Math.min(100, (points % 60) * (100 / 60));

  const streak = useMemo(() => {
    let count = 0;
    let cursor = new Date();
    while (entries[formatDate(cursor)]) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }, [entries]);

  const moodVariety = useMemo(() => {
    const unique = new Set<string>();
    Object.values(entries).forEach((entry) => {
      entry.moods.forEach((mood) => unique.add(mood));
    });
    return unique.size;
  }, [entries]);

  const badges = [
    {
      label: "First Bloom",
      earned: totalEntries >= 1,
    },
    {
      label: "3-Day Streak",
      earned: streak >= 3,
    },
    {
      label: "7-Day Streak",
      earned: streak >= 7,
    },
    {
      label: "Mood Muse",
      earned: moodVariety >= 4,
    },
  ];

  const handleSave = () => {
    if (!draftText.trim()) return;
    const sentences = countSentences(draftText);
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        title: draftTitle.trim(),
        text: draftText.trim(),
        moods: draftMoods,
        createdAt: new Date().toISOString(),
      },
    }));
    
    // trigger koala celebration
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    
    if (sentences >= 5) {
      const pick =
        REWARD_VIDEOS[Math.floor(Math.random() * REWARD_VIDEOS.length)];
      setRewardVideo(pick);
      setRewardOpen(true);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const entry = entries[dateStr];
    if (entry) {
      setDraftTitle(entry.title);
      setDraftText(entry.text);
      setDraftMoods(entry.moods);
    } else {
      setDraftTitle("");
      setDraftText("");
      setDraftMoods([]);
    }
  };

  const handleMoodToggle = (key: string) => {
    setDraftMoods((prev) =>
      prev.includes(key) ? prev.filter((mood) => mood !== key) : [...prev, key]
    );
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,216,232,0.7),transparent_60%),radial-gradient(circle_at_20%_20%,rgba(255,196,220,0.7),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,235,245,0.9),transparent_40%),linear-gradient(180deg,#ffe5f1,#ffd1e8_30%,#ffeff7_70%,#fff) ] text-zinc-800">
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <div className="text-4xl">💗</div>
          <div className="font-[family-name:var(--font-bricolage)] text-3xl font-semibold text-rose-700">
            Gaia
          </div>
          <p className="text-sm text-rose-500">warming up your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,216,232,0.7),transparent_60%),radial-gradient(circle_at_20%_20%,rgba(255,196,220,0.7),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,235,245,0.9),transparent_40%),linear-gradient(180deg,#ffe5f1,#ffd1e8_30%,#ffeff7_70%,#fff) ] text-zinc-800">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-rose-200/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-400">
                daily glow journal
              </p>
              <h1 className="font-[family-name:var(--font-bricolage)] text-4xl sm:text-5xl font-bold text-rose-700">
                Gaia
              </h1>
              <p className="font-[family-name:var(--font-instrument-serif)] text-lg text-rose-600">
                a soft place to land, reflect, and grow a little every day
              </p>
            </div>
            <Card className="w-full max-w-xs border-none bg-white/70 backdrop-blur">
              <CardBody className="gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-rose-500">today&apos;s streak</span>
                  <span className="text-2xl font-semibold text-rose-700">{streak} days</span>
                </div>
                <Progress
                  value={levelProgress}
                  classNames={{
                    indicator: "bg-gradient-to-r from-pink-400 to-rose-400",
                    track: "bg-rose-100",
                  }}
                />
                <div className="flex items-center justify-between text-sm text-rose-500">
                  <span>level {level}</span>
                  <span>{points} petals</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <Card className="border-none bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-rose-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-500">
                    entry for {selectedDate}
                  </div>
                </div>
                <Input
                  label="Title"
                  placeholder=""
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  classNames={{
                    inputWrapper: "bg-rose-50/60",
                    label: "text-rose-500",
                  }}
                />
              </CardHeader>
              <CardBody className="gap-4">
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <Chip
                      key={mood.key}
                      className={`${mood.color} cursor-pointer border border-white/80`}
                      variant={draftMoods.includes(mood.key) ? "solid" : "flat"}
                      onClick={() => handleMoodToggle(mood.key)}
                    >
                      {mood.label}
                    </Chip>
                  ))}
                </div>
                <Textarea
                  label="What did today feel like?"
                  placeholder=""
                  minRows={8}
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  classNames={{
                    inputWrapper: "bg-rose-50/60",
                    label: "text-rose-500",
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 text-white"
                    onPress={handleSave}
                  >
                    save entry
                  </Button>
                  <Button
                    variant="flat"
                    className="bg-white/70 text-rose-600"
                    onPress={() => handleSelectDate(todayStr)}
                  >
                    jump to today
                  </Button>
                  {!draftText.trim() && (
                    <span className="text-xs text-rose-400">
                      add even one line to keep your streak glowing
                    </span>
                  )}
                  {draftText.trim() && countSentences(draftText) < 5 && (
                    <span className="text-xs text-rose-400">
                      write 5 sentences to unlock a surprise video gift
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-none bg-white/80 backdrop-blur">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-400">
                      daily quest
                    </p>
                    <p className="font-[family-name:var(--font-instrument-serif)] text-lg text-rose-700">
                      write 3 gentle sentences
                    </p>
                  </div>
                  <div className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-500">
                    +15 petals
                  </div>
                </CardHeader>
                <CardBody className="gap-2 text-sm text-rose-600">
                  <p>tiny reflections count. you&apos;re building a habit, not a novel.</p>
                  <div className="flex items-center gap-2">
                    <Divider className="flex-1 bg-rose-100" />
                    <span className="text-xs text-rose-400">tap save to complete</span>
                  </div>
                </CardBody>
              </Card>

              <Card className="border-none bg-white/80 backdrop-blur">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-400">
                      mascot
                    </p>
                    <p className="font-[family-name:var(--font-instrument-serif)] text-lg text-rose-700">
                      your koala cheerleader
                    </p>
                  </div>
                </CardHeader>
                <CardBody className="flex items-center gap-4">
                  <KoalaMascot
                    streak={streak}
                    moods={draftMoods}
                    justSaved={justSaved}
                  />
                  <div className="text-sm text-rose-600">
                    <p className="font-semibold text-rose-700">
                      {streak === 0 && "say hi to your koala"}
                      {streak >= 1 && streak < 3 && "she's proud of you"}
                      {streak >= 3 && streak < 7 && "she's cheering you on"}
                      {streak >= 7 && "she's your biggest fan"}
                    </p>
                    <p>
                      {streak === 0 && "she celebrates every entry you save."}
                      {streak >= 1 && streak < 3 && "keep the momentum going!"}
                      {streak >= 3 && streak < 7 && "you're building something real."}
                      {streak >= 7 && "this streak is incredible!"}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            <Card className="border-none bg-white/80 backdrop-blur">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">calendar</p>
                  <p className="text-lg font-semibold text-rose-700">
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    variant="light"
                    className="text-rose-500"
                    onPress={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                  >
                    ‹
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    className="text-rose-500"
                    onPress={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                  >
                    ›
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="gap-3">
                <div className="grid grid-cols-7 text-center text-xs uppercase text-rose-400">
                  {[
                    "sun",
                    "mon",
                    "tue",
                    "wed",
                    "thu",
                    "fri",
                    "sat",
                  ].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {monthCells.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} />;
                    }
                    const dateStr = formatDate(date);
                    const hasEntry = Boolean(entries[dateStr]);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    return (
                      <Button
                        key={dateStr}
                        variant={isSelected ? "solid" : "flat"}
                        size="sm"
                        className={`h-10 w-10 rounded-full ${
                          isSelected
                            ? "bg-gradient-to-br from-rose-400 to-pink-400 text-white"
                            : "bg-rose-50/70 text-rose-600"
                        } ${isToday && !isSelected ? "ring-2 ring-rose-300" : ""}`}
                        onPress={() => handleSelectDate(dateStr)}
                      >
                        <div className="relative flex h-full w-full items-center justify-center">
                          <span>{date.getDate()}</span>
                          {hasEntry && (
                            <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-rose-400" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <Card className="border-none bg-white/80 backdrop-blur">
              <CardHeader>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">recent blooms</p>
                  <p className="text-lg font-semibold text-rose-700">past entries</p>
                </div>
              </CardHeader>
              <CardBody className="gap-3">
                {Object.keys(entries)
                  .sort((a, b) => (a < b ? 1 : -1))
                  .slice(0, 4)
                  .map((dateKey) => (
                    <button
                      key={dateKey}
                      type="button"
                      className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-left"
                      onClick={() => handleSelectDate(dateKey)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-rose-700">{dateKey}</span>
                        <span className="text-xs text-rose-400">
                          {entries[dateKey].moods.join(", ") || "moodless"}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-rose-600">
                        {entries[dateKey].title || entries[dateKey].text}
                      </p>
                    </button>
                  ))}
                {totalEntries === 0 && (
                  <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-6 text-center text-sm text-rose-500">
                    your past entries will appear here as soon as you save your first one
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="border-none bg-white/80 backdrop-blur">
              <CardHeader>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">badges</p>
                  <p className="text-lg font-semibold text-rose-700">your glow shelf</p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Chip
                    key={badge.label}
                    className={`border ${badge.earned ? "bg-rose-100 text-rose-700" : "bg-white text-rose-300"}`}
                    variant="flat"
                  >
                    {badge.label}
                  </Chip>
                ))}
              </CardBody>
            </Card>
          </motion.div>
        </div>

        <Spacer y={4} />
        <Divider className="bg-rose-100" />
        <p className="text-center text-xs text-rose-400">
          everything stays on this device. your words are yours.
        </p>
      </div>

      <Modal
        isOpen={rewardOpen}
        onOpenChange={setRewardOpen}
        size="2xl"
        classNames={{ base: "bg-white/95" }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-rose-400">
              journal reward
            </span>
            <span className="text-2xl font-semibold text-rose-700">
              you earned a video gift
            </span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-rose-500">
              5+ sentences unlocked this. take the win, enjoy the vibe.
            </p>
            {rewardVideo && (
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/60">
                <iframe
                  title={rewardVideo.label}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${rewardVideo.id}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="bg-rose-50 text-rose-600"
              onPress={() => setRewardOpen(false)}
            >
              back to journaling
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
