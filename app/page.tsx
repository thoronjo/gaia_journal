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
import DeepInsights from "@/components/DeepInsights";
import { useRouter } from "next/navigation";

const MOODS = [
  { key: "soft", label: "Soft", color: "bg-pink-100 text-pink-700", free: true },
  { key: "glow", label: "Glow", color: "bg-rose-100 text-rose-700", free: true },
  { key: "calm", label: "Calm", color: "bg-fuchsia-100 text-fuchsia-700", free: true },
  { key: "brave", label: "Brave", color: "bg-pink-200 text-pink-800", free: false },
  { key: "dreamy", label: "Dreamy", color: "bg-rose-200 text-rose-800", free: false },
  { key: "bold", label: "Bold", color: "bg-fuchsia-200 text-fuchsia-800", free: false },
];

const REWARD_VIDEOS = [
  {
    id: "J---aiyznGQ",
    label: "tiny kitten zoomies",
    moods: ["glow", "soft"],
  },
  {
    id: "hY7m5jjJ9mM",
    label: "cats being dramatic",
    moods: ["bold", "glow"],
  },
  {
    id: "3GwjfUFyY6M",
    label: "feel-good mood boost",
    moods: ["brave", "glow"],
  },
  {
    id: "KxGRhd_iWuE",
    label: "random giggle break",
    moods: ["soft", "dreamy"],
  },
  {
    id: "b89CnP0Iq30",
    label: "peaceful nature sounds",
    moods: ["calm", "soft"],
  },
  {
    id: "lFcSrYw-ARY",
    label: "cozy rainy day vibes",
    moods: ["calm", "dreamy"],
  },
  {
    id: "inpok4MKVLM",
    label: "you got this energy",
    moods: ["brave", "bold"],
  },
  {
    id: "ZXsQAXx_ao0",
    label: "satisfying moments",
    moods: ["calm", "glow"],
  },
];

const DAILY_QUESTS = [
  { prompt: "write 3 gentle sentences", description: "tiny reflections count. you're building a habit, not a novel.", petals: 15 },
  { prompt: "describe one moment that made you smile", description: "even small joys deserve to be remembered.", petals: 15 },
  { prompt: "write about something you're grateful for", description: "gratitude shifts everything, even on hard days.", petals: 15 },
  { prompt: "capture a feeling in 5 words or less", description: "sometimes less is more. distill your day.", petals: 15 },
  { prompt: "write about what you're looking forward to", description: "hope is a practice. what's coming that excites you?", petals: 15 },
  { prompt: "reflect on something you learned today", description: "growth happens in tiny moments. what did today teach you?", petals: 15 },
  { prompt: "write a letter to your future self", description: "what do you want to remember about right now?", petals: 20 },
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
  photos?: string[]; // base64 encoded images
};

type Entries = Record<string, Entry>;

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; isPremium: boolean } | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    
    // check auth
    const storedUser = localStorage.getItem("gaia-user");
    if (!storedUser) {
      router.push("/auth");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

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

  const moodStats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(entries).forEach((entry) => {
      entry.moods.forEach((mood) => {
        counts[mood] = (counts[mood] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const badges = [
    {
      label: "First Bloom",
      earned: totalEntries >= 1,
      description: "wrote your first entry",
    },
    {
      label: "3-Day Streak",
      earned: streak >= 3,
      description: "journaled 3 days in a row",
    },
    {
      label: "Week Warrior",
      earned: streak >= 7,
      description: "7-day streak unlocked",
    },
    {
      label: "Fortnight Focus",
      earned: streak >= 14,
      description: "14 days of consistency",
    },
    {
      label: "Month Master",
      earned: streak >= 30,
      description: "30-day streak achieved",
    },
    {
      label: "Mood Muse",
      earned: moodVariety >= 4,
      description: "explored 4 different moods",
    },
    {
      label: "Feeling Everything",
      earned: moodVariety >= 6,
      description: "tagged all 6 moods",
    },
    {
      label: "10 Entries",
      earned: totalEntries >= 10,
      description: "saved 10 journal entries",
    },
    {
      label: "25 Entries",
      earned: totalEntries >= 25,
      description: "saved 25 journal entries",
    },
    {
      label: "50 Entries",
      earned: totalEntries >= 50,
      description: "saved 50 journal entries",
    },
    {
      label: "Century Club",
      earned: totalEntries >= 100,
      description: "100 entries milestone",
    },
    {
      label: "Weekend Writer",
      earned: Object.keys(entries).some((dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDay();
        return day === 0 || day === 6;
      }),
      description: "journaled on a weekend",
    },
    {
      label: "Early Bird",
      earned: Object.values(entries).some((entry) => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 5 && hour < 9;
      }),
      description: "wrote an entry before 9am",
    },
    {
      label: "Night Owl",
      earned: Object.values(entries).some((entry) => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 22 || hour < 5;
      }),
      description: "journaled after 10pm",
    },
    {
      label: "Wordsmith",
      earned: Object.values(entries).some((entry) => entry.text.split(/\s+/).length >= 200),
      description: "wrote 200+ words in one entry",
    },
    {
      label: "Title Master",
      earned: Object.values(entries).filter((entry) => entry.title.trim()).length >= 10,
      description: "titled 10 entries",
    },
  ];

  // pick daily quest based on day of year so it rotates consistently
  const todayQuest = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_QUESTS[dayOfYear % DAILY_QUESTS.length];
  }, []);

  // filter entries based on search and mood
  const filteredEntries = useMemo(() => {
    let result = Object.entries(entries);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(([_, entry]) => {
        return (
          entry.title.toLowerCase().includes(query) ||
          entry.text.toLowerCase().includes(query)
        );
      });
    }

    if (filterMood) {
      result = result.filter(([_, entry]) => entry.moods.includes(filterMood));
    }

    return result.sort(([a], [b]) => (a < b ? 1 : -1));
  }, [entries, searchQuery, filterMood]);

  const handleSave = () => {
    if (!draftText.trim()) return;
    const sentences = countSentences(draftText);
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        title: draftTitle.trim(),
        text: draftText.trim(),
        moods: draftMoods,
        photos: draftPhotos,
        createdAt: new Date().toISOString(),
      },
    }));
    
    // trigger koala celebration
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    
    if (sentences >= 5) {
      // pick video based on mood tags
      let matchingVideos = REWARD_VIDEOS;
      
      if (draftMoods.length > 0) {
        // filter videos that match any of the user's moods
        const moodMatches = REWARD_VIDEOS.filter((video) =>
          video.moods.some((mood) => draftMoods.includes(mood))
        );
        if (moodMatches.length > 0) {
          matchingVideos = moodMatches;
        }
      }
      
      const pick = matchingVideos[Math.floor(Math.random() * matchingVideos.length)];
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
      setDraftPhotos(entry.photos || []);
    } else {
      setDraftTitle("");
      setDraftText("");
      setDraftMoods([]);
      setDraftPhotos([]);
    }
  };

  const handleMoodToggle = (key: string) => {
    const mood = MOODS.find((m) => m.key === key);
    if (mood && !mood.free && !user?.isPremium) {
      setUpgradeModalOpen(true);
      return;
    }
    setDraftMoods((prev) =>
      prev.includes(key) ? prev.filter((mood) => mood !== key) : [...prev, key]
    );
  };

  const handleUpgrade = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      localStorage.setItem("gaia-user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setUpgradeModalOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gaia-user");
    router.push("/auth");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.isPremium) {
      setUpgradeModalOpen(true);
      return;
    }

    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("photo must be under 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDraftPhotos((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setDraftPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExportPDF = async () => {
    if (!user?.isPremium) {
      setUpgradeModalOpen(true);
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // title page
    doc.setFontSize(24);
    doc.setTextColor(251, 113, 133); // rose-500
    doc.text("Gaia Journal", pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${user.name}'s entries`, pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 10;
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 20;
    doc.setFontSize(10);
    doc.text(`Total entries: ${totalEntries}`, pageWidth / 2, yPosition, { align: "center" });
    
    // entries
    const sortedEntries = Object.entries(entries).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    
    for (const [dateStr, entry] of sortedEntries) {
      // check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      
      yPosition += 15;
      
      // date
      doc.setFontSize(14);
      doc.setTextColor(251, 113, 133);
      doc.text(dateStr, margin, yPosition);
      yPosition += 8;
      
      // moods
      if (entry.moods.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Moods: ${entry.moods.join(", ")}`, margin, yPosition);
        yPosition += 6;
      }
      
      // title
      if (entry.title) {
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        const titleLines = doc.splitTextToSize(entry.title, maxWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 6;
      }
      
      // text
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const textLines = doc.splitTextToSize(entry.text, maxWidth);
      
      for (const line of textLines) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;
      
      // separator
      doc.setDrawColor(251, 207, 232); // rose-200
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
    }
    
    doc.save(`gaia-journal-${new Date().toISOString().split("T")[0]}.pdf`);
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👋</div>
              <div>
                <p className="text-sm text-rose-500">welcome back,</p>
                <p className="font-semibold text-rose-700">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.isPremium ? (
                <Chip className="bg-gradient-to-r from-amber-400 to-orange-400 text-white" variant="solid">
                  ✨ premium
                </Chip>
              ) : (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                  onPress={() => setUpgradeModalOpen(true)}
                >
                  upgrade
                </Button>
              )}
              {user?.isPremium && totalEntries > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-white/70 text-rose-600"
                  onPress={handleExportPDF}
                >
                  📥 export pdf
                </Button>
              )}
              <Button
                size="sm"
                variant="flat"
                className="bg-white/70 text-rose-600"
                onPress={handleLogout}
              >
                logout
              </Button>
            </div>
          </div>
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
                  {MOODS.map((mood) => {
                    const isLocked = !mood.free && !user?.isPremium;
                    return (
                      <Chip
                        key={mood.key}
                        className={`${mood.color} cursor-pointer border border-white/80 ${
                          isLocked ? "opacity-50" : ""
                        }`}
                        variant={draftMoods.includes(mood.key) ? "solid" : "flat"}
                        onClick={() => handleMoodToggle(mood.key)}
                      >
                        {isLocked && "🔒 "}
                        {mood.label}
                      </Chip>
                    );
                  })}
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
                
                {user?.isPremium && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-rose-500">photos (premium)</label>
                    <div className="flex flex-wrap gap-2">
                      {draftPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`upload ${index + 1}`}
                            className="h-20 w-20 rounded-xl object-cover border border-rose-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {draftPhotos.length < 5 && (
                        <label className="h-20 w-20 rounded-xl border-2 border-dashed border-rose-300 flex items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 transition-all">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <span className="text-2xl text-rose-400">+</span>
                        </label>
                      )}
                    </div>
                    {draftPhotos.length >= 5 && (
                      <p className="text-xs text-rose-400">max 5 photos per entry</p>
                    )}
                  </div>
                )}
                
                {!user?.isPremium && (
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 px-4 py-3 text-left hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📸</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-600">add photos to entries</p>
                        <p className="text-xs text-amber-500">upgrade to premium to unlock</p>
                      </div>
                    </div>
                  </button>
                )}
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
                      {todayQuest.prompt}
                    </p>
                  </div>
                  <div className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-500">
                    +{todayQuest.petals} petals
                  </div>
                </CardHeader>
                <CardBody className="gap-2 text-sm text-rose-600">
                  <p>{todayQuest.description}</p>
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
                    const entry = entries[dateStr];
                    const hasEntry = Boolean(entry);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    // get dominant mood color for this day
                    let moodColor = "";
                    if (entry && entry.moods.length > 0) {
                      const firstMood = MOODS.find((m) => m.key === entry.moods[0]);
                      if (firstMood) {
                        // extract just the bg color for the ring
                        const bgMatch = firstMood.color.match(/bg-(\w+-\d+)/);
                        if (bgMatch) {
                          moodColor = `ring-${bgMatch[1]}`;
                        }
                      }
                    }

                    return (
                      <Button
                        key={dateStr}
                        variant={isSelected ? "solid" : "flat"}
                        size="sm"
                        className={`h-10 w-10 rounded-full ${
                          isSelected
                            ? "bg-gradient-to-br from-rose-400 to-pink-400 text-white"
                            : "bg-rose-50/70 text-rose-600"
                        } ${isToday && !isSelected ? "ring-2 ring-rose-300" : ""} ${
                          hasEntry && !isSelected && moodColor ? `ring-2 ${moodColor}` : ""
                        }`}
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
                <div className="w-full">
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">recent blooms</p>
                  <p className="text-lg font-semibold text-rose-700">past entries</p>
                </div>
              </CardHeader>
              <CardBody className="gap-3">
                <Input
                  placeholder="search your entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-rose-50/60",
                  }}
                  isClearable
                  onClear={() => setSearchQuery("")}
                />
                <div className="flex flex-wrap gap-2">
                  <Chip
                    className={`cursor-pointer border ${
                      filterMood === null
                        ? "bg-rose-100 text-rose-700"
                        : "bg-white text-rose-400"
                    }`}
                    variant="flat"
                    onClick={() => setFilterMood(null)}
                  >
                    all moods
                  </Chip>
                  {MOODS.map((mood) => (
                    <Chip
                      key={mood.key}
                      className={`cursor-pointer border ${
                        filterMood === mood.key
                          ? mood.color
                          : "bg-white text-rose-400"
                      }`}
                      variant="flat"
                      onClick={() => setFilterMood(mood.key)}
                    >
                      {mood.label}
                    </Chip>
                  ))}
                </div>
                {filteredEntries.slice(0, 4).map(([dateKey, entry]) => (
                  <button
                    key={dateKey}
                    type="button"
                    className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-left transition-all hover:bg-rose-100/70"
                    onClick={() => handleSelectDate(dateKey)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-rose-700">{dateKey}</span>
                      <span className="text-xs text-rose-400">
                        {entry.moods.join(", ") || "moodless"}
                      </span>
                    </div>
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {entry.photos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ))}
                        {entry.photos.length > 3 && (
                          <div className="h-12 w-12 rounded-lg bg-rose-200/50 flex items-center justify-center text-xs text-rose-600">
                            +{entry.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="line-clamp-2 text-sm text-rose-600">
                      {entry.title || entry.text}
                    </p>
                  </button>
                ))}
                {filteredEntries.length === 0 && totalEntries > 0 && (
                  <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-6 text-center text-sm text-rose-500">
                    no entries match your search or filter
                  </div>
                )}
                {totalEntries === 0 && (
                  <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-6 text-center text-sm text-rose-500">
                    your past entries will appear here as soon as you save your first one
                  </div>
                )}
                {filteredEntries.length > 4 && (
                  <p className="text-xs text-rose-400 text-center">
                    +{filteredEntries.length - 4} more {filteredEntries.length - 4 === 1 ? "entry" : "entries"}
                  </p>
                )}
              </CardBody>
            </Card>

            <Card className="border-none bg-white/80 backdrop-blur">
              <CardHeader>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">badges</p>
                  <p className="text-lg font-semibold text-rose-700">your glow shelf</p>
                  <p className="text-xs text-rose-500 mt-1">
                    {badges.filter((b) => b.earned).length} of {badges.length} unlocked
                  </p>
                </div>
              </CardHeader>
              <CardBody className="gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.label}
                      className={`rounded-xl border p-3 transition-all ${
                        badge.earned
                          ? "bg-rose-100 border-rose-200"
                          : "bg-white border-rose-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {badge.earned ? "🌸" : "🔒"}
                        </span>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              badge.earned ? "text-rose-700" : "text-rose-400"
                            }`}
                          >
                            {badge.label}
                          </p>
                          <p
                            className={`text-xs ${
                              badge.earned ? "text-rose-600" : "text-rose-400"
                            }`}
                          >
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {totalEntries > 0 && user?.isPremium && (
              <>
                <Card className="border-none bg-white/80 backdrop-blur">
                  <CardHeader>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-rose-400">mood insights</p>
                      <p className="text-lg font-semibold text-rose-700">how you've been feeling</p>
                    </div>
                  </CardHeader>
                  <CardBody className="gap-3">
                    {moodStats.length === 0 ? (
                      <p className="text-sm text-rose-500">start tagging moods to see patterns</p>
                    ) : (
                      <>
                        {moodStats.slice(0, 3).map((stat) => {
                          const moodData = MOODS.find((m) => m.key === stat.mood);
                          const percentage = Math.round((stat.count / totalEntries) * 100);
                          return (
                            <div key={stat.mood} className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <Chip
                                  size="sm"
                                  className={moodData?.color || "bg-rose-100 text-rose-700"}
                                  variant="flat"
                                >
                                  {moodData?.label || stat.mood}
                                </Chip>
                                <span className="text-xs text-rose-500">
                                  {stat.count} {stat.count === 1 ? "entry" : "entries"} · {percentage}%
                                </span>
                              </div>
                              <Progress
                                value={percentage}
                                size="sm"
                                classNames={{
                                  indicator: "bg-gradient-to-r from-pink-400 to-rose-400",
                                  track: "bg-rose-100",
                                }}
                              />
                            </div>
                          );
                        })}
                        {moodStats.length > 3 && (
                          <p className="text-xs text-rose-400 text-center mt-1">
                            +{moodStats.length - 3} more mood{moodStats.length - 3 === 1 ? "" : "s"} tracked
                          </p>
                        )}
                      </>
                    )}
                  </CardBody>
                </Card>

                <DeepInsights entries={entries} />
              </>
            )}
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

      <Modal
        isOpen={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        size="2xl"
        classNames={{ base: "bg-white/95" }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400">
              unlock premium
            </span>
            <span className="text-2xl font-semibold text-rose-700">
              get the full gaia experience
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-200">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-amber-600">$4.99</span>
                  <span className="text-sm text-amber-500">/month</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">✨</span>
                    <div>
                      <p className="font-semibold text-rose-700">unlock all 6 moods</p>
                      <p className="text-sm text-rose-600">express the full range of your feelings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="font-semibold text-rose-700">mood insights & patterns</p>
                      <p className="text-sm text-rose-600">see how you've been feeling over time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎁</span>
                    <div>
                      <p className="font-semibold text-rose-700">more reward videos</p>
                      <p className="text-sm text-rose-600">unlock the full video library</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📥</span>
                    <div>
                      <p className="font-semibold text-rose-700">export your journal</p>
                      <p className="text-sm text-rose-600">download all your entries as text</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-rose-400 text-center">
                this is a demo — clicking upgrade will simulate premium access
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-2">
            <Button
              variant="flat"
              className="bg-rose-50 text-rose-600"
              onPress={() => setUpgradeModalOpen(false)}
            >
              maybe later
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white"
              onPress={handleUpgrade}
            >
              upgrade now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
