import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  TrendingUp, MessageSquare, Target, Award, AlertCircle,
  CheckCircle2, ArrowUp, ArrowDown, Loader2, Sparkles,
  Upload, FileText, Video, X, ChevronRight, Zap
} from "lucide-react";
import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoachingResponse {
  empathy_score: number;
  clarity_score: number;
  coaching_tips: string[];
  summary: string;
}

type InputMode = "text" | "file" | "video";
type AIStatus  = "idle" | "loading" | "success" | "error";

// ─── Mock Consultation Scripts ────────────────────────────────────────────────
const MOCK_SCRIPTS = [
  {
    id: "strong",
    label: "🟢 Strong Session",
    subLabel: "Expected scores: 85–92",
    consultant: "Sarah",
    transcript: `Sarah: Good morning! Thank you so much for taking the time to speak with me today. 
How are you feeling about the role so far?

Candidate: Honestly, I'm really excited. I've been following this company for a while.

Sarah: That's wonderful to hear! I really want to make sure this is the right fit for 
you — both technically and culturally. Can you tell me a bit about what drew you to 
this particular position?

Candidate: I love that it's a senior product role with actual ownership. My current job 
has me doing a lot of execution but not much strategy.

Sarah: I completely understand that feeling. You want to have real impact, not just 
execute someone else's roadmap. That makes total sense given your background. Let me 
walk you through what the day-to-day actually looks like here, because I want to be 
transparent — there's still some execution in the first 6 months while you build trust 
with the team. Is that something you'd be comfortable with?

Candidate: Honestly yes, I expected that. It's fine.

Sarah: Great. Now let's talk about compensation — I want to make sure we're aligned 
before we go further so neither of us wastes time. The band for this role is 
₹28–35 LPA depending on experience. Does that work for you?

Candidate: That's actually right in the range I was hoping for.

Sarah: Perfect. I also want to mention our flexible work policy — fully remote 3 days 
a week, and we're very serious about work-life balance. Is there anything else about 
the role or company culture you'd like me to clarify?

Candidate: Actually yes — what's the growth path after this role?

Sarah: Excellent question. Most people in this position move into a Director of Product 
role within 18–24 months, and we have two people who did exactly that last year. I'll 
send you their LinkedIn profiles if you'd like to connect with them directly.

Candidate: That would be amazing, thank you so much.

Sarah: Of course! You're a strong candidate and I genuinely think this could be a 
great mutual fit. I'll follow up with next steps by end of day today.`,
  },
  {
    id: "average",
    label: "🟡 Average Session",
    subLabel: "Expected scores: 60–72",
    consultant: "Sarah",
    transcript: `Sarah: Hi, thanks for joining. Let's get started — can you walk me through 
your experience?

Candidate: Sure. I've been a software engineer for about 6 years, mostly backend, 
some full stack. I've led a team of 3 for the last year.

Sarah: Okay, good. The role requires 5 years so you meet the bar. Do you know React?

Candidate: I've used it a bit, mostly Vue though. Would that be a problem?

Sarah: Probably not, they can train you. Salary — we're offering around ₹22 LPA. 
Is that okay?

Candidate: Hmm, I was expecting a bit more. My current CTC is ₹20 LPA and I was 
hoping for at least ₹25.

Sarah: I'll check if there's flexibility. Usually there isn't much room but I'll ask. 
So the role is mostly backend microservices. You'd be working with Kafka, AWS, 
and a Node.js stack. Any concerns?

Candidate: Not really. I've used AWS before. Kafka is new but I can learn.

Sarah: Right. The team is about 12 people, pretty fast-paced. Are you okay with that?

Candidate: Yes, I'm used to startups.

Sarah: Okay great. I'll send you the job description again and let you know about 
next steps. Any questions?

Candidate: What does the interview process look like?

Sarah: It's 3 rounds — one technical, one system design, one with the hiring manager. 
Usually takes about 2 weeks.

Candidate: Sounds good, thanks.

Sarah: Sure. I'll be in touch.`,
  },
  {
    id: "poor",
    label: "🔴 Needs Improvement",
    subLabel: "Expected scores: 35–52",
    consultant: "Sarah",
    transcript: `Sarah: Okay so I have your CV here. You've been at your current job 
for only 8 months — why are you leaving so soon?

Candidate: It's a bit complicated. There were some management issues and—

Sarah: Right, so job hopping. That's going to be a concern for the client.

Candidate: I wouldn't call it job hopping, it was a specific situation where—

Sarah: Let me stop you there. The client is very particular about stability. 
Anyway, do you know Python?

Candidate: Yes, quite well actually. I have 4 years of—

Sarah: And SQL?

Candidate: Yes.

Sarah: Cloud?

Candidate: AWS mainly, some GCP.

Sarah: Okay. The salary is ₹18 LPA. Take it or leave it basically, there's no 
negotiation on this one.

Candidate: Oh. That's lower than I expected. I'm currently at ₹17 and was hoping 
for at least ₹21–22.

Sarah: Like I said, no flexibility. It's a fixed band. Do you want to proceed or not?

Candidate: Can I at least know more about the role before deciding?

Sarah: It's a data engineering role, pretty standard stuff. I already sent you 
the JD last week.

Candidate: I didn't receive it actually.

Sarah: I definitely sent it. Anyway, are you interested or should I move on to 
the next candidate?

Candidate: I mean... I'd like to know more before committing.

Sarah: Look, I have 10 more calls today. Yes or no?

Candidate: I'll pass, thank you.

Sarah: Okay bye.`,
  },
];

// ─── Static seed data ─────────────────────────────────────────────────────────
const performanceData = [
  { week: "Week 1", empathy: 72, clarity: 68, engagement: 75 },
  { week: "Week 2", empathy: 75, clarity: 71, engagement: 78 },
  { week: "Week 3", empathy: 78, clarity: 74, engagement: 80 },
  { week: "Week 4", empathy: 82, clarity: 79, engagement: 85 },
];

const recentSessions = [
  { id: 1, candidateName: "Alex Johnson",  date: "Today, 2:30 PM",      duration: "45 min", empathyScore: 85, status: "excellent" },
  { id: 2, candidateName: "Maria Chen",    date: "Yesterday, 10:00 AM", duration: "38 min", empathyScore: 78, status: "good"      },
  { id: 3, candidateName: "James Wilson",  date: "2 days ago, 3:15 PM", duration: "52 min", empathyScore: 88, status: "excellent" },
];

const VIDEO_AUDIO_EXTS = [".mp4", ".mov", ".avi", ".webm", ".mp3", ".wav", ".m4a", ".ogg"];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [empathyScore, setEmpathyScore] = useState(82);
  const [clarityScore, setClarityScore] = useState(79);
  const [coachingTips, setCoachingTips] = useState<string[]>([
    "Explore AI-agentic roles — they pay 40% more than traditional software roles.",
    "Try the 'pause and reflect' technique; you interrupted candidates in 3 recent sessions.",
    "Your technical screening is excellent (88/100). Develop salary-negotiation skills next.",
  ]);
  const [aiSummary,  setAiSummary]  = useState<string | null>(null);
  const [aiStatus,   setAiStatus]   = useState<AIStatus>("idle");

  // Modal
  const [modalOpen,      setModalOpen]      = useState(false);
  const [inputMode,      setInputMode]      = useState<InputMode>("text");
  const [consultantName, setConsultantName] = useState("Sarah");
  const [transcript,     setTranscript]     = useState("");
  const [selectedFile,   setSelectedFile]   = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [loadingMsg,     setLoadingMsg]     = useState("Analysing…");
  const [activeScript,   setActiveScript]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metricsData = [
    { metric: "Empathy",          value: empathyScore, target: 85 },
    { metric: "Clarity",          value: clarityScore, target: 85 },
    { metric: "Engagement",       value: 85,           target: 85 },
    { metric: "Market Awareness", value: 76,           target: 80 },
    { metric: "Opportunity ID",   value: 88,           target: 85 },
  ];

  // ── Load a mock script ──────────────────────────────────────────────────
  const loadMockScript = (scriptId: string) => {
    const script = MOCK_SCRIPTS.find(s => s.id === scriptId);
    if (!script) return;
    setActiveScript(scriptId);
    setTranscript(script.transcript);
    setConsultantName(script.consultant);
    setInputMode("text");
  };

  // ── File picker ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setActiveScript(null);
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    if (VIDEO_AUDIO_EXTS.includes(ext) && f.type.startsWith("video")) {
      setFilePreviewUrl(URL.createObjectURL(f));
    } else {
      setFilePreviewUrl(null);
    }
  };

  // ── Analyse ─────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!consultantName.trim()) return;
    setAiStatus("loading");
    setLoadingMsg(inputMode === "video" ? "Uploading to Gemini…" : "Analysing session…");

    try {
      let result: CoachingResponse | null = null;

      if (inputMode === "text") {
        if (!transcript.trim()) { setAiStatus("error"); return; }
        const res = await fetch("https://hr-coaching-agent.onrender.com/analyze-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultant_name: consultantName, transcript }),
        });
        result = await res.json();
      } else {
        if (!selectedFile) { setAiStatus("error"); return; }
        if (inputMode === "video") setLoadingMsg("Processing media with Gemini…");
        const form = new FormData();
        form.append("consultant_name", consultantName);
        form.append("file", selectedFile);
        const res = await fetch("https://hr-coaching-agent.onrender.com/analyze-file", {
          method: "POST",
          body: form,
        });
        result = await res.json();
      }

      if (result) {
        setEmpathyScore(result.empathy_score);
        setClarityScore(result.clarity_score);
        setCoachingTips(result.coaching_tips);
        setAiSummary(result.summary);
        setAiStatus("success");
        setModalOpen(false);
      } else {
        setAiStatus("error");
      }
    } catch (err) {
      console.error(err);
      setAiStatus("error");
    }
  };

  const tipIcons = [TrendingUp, MessageSquare, Target];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">HR Coaching Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, Sarah. Here's your performance overview.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-primary">4 Consultations</p>
              </div>
              <Button
                onClick={() => { setModalOpen(true); setAiStatus("idle"); }}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Sparkles className="w-4 h-4" /> Run AI Analysis
              </Button>
            </div>
          </div>

          {aiStatus === "success" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <CheckCircle2 className="w-4 h-4" />
              AI analysis complete — metrics &amp; coaching tips updated.
            </div>
          )}
          {aiStatus === "error" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4" />
              Could not reach the agent. Make sure FastAPI is running on port 8000.
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-xl font-bold text-foreground">Analyse a Session</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Choose a demo script or provide your own</p>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Quick Select Mock Scripts ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Quick Demo Scripts</span>
                  <Badge variant="secondary" className="text-xs">One-click load</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {MOCK_SCRIPTS.map(script => (
                    <button
                      key={script.id}
                      onClick={() => loadMockScript(script.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-left transition-all
                        ${activeScript === script.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                        }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{script.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{script.subLabel}</p>
                      </div>
                      {activeScript === script.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">OR USE YOUR OWN</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Consultant Name */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Consultant Name
                </label>
                <input
                  type="text"
                  value={consultantName}
                  onChange={e => { setConsultantName(e.target.value); setActiveScript(null); }}
                  placeholder="e.g. Sarah"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Mode Tabs */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Input Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { mode: "text",  icon: FileText, label: "Text"       },
                    { mode: "file",  icon: Upload,   label: "File (.txt/.docx)" },
                    { mode: "video", icon: Video,    label: "Video / Audio" },
                  ] as { mode: InputMode; icon: any; label: string }[]).map(({ mode, icon: Icon, label }) => (
                    <button key={mode}
                      onClick={() => {
                        setInputMode(mode);
                        setSelectedFile(null);
                        setFilePreviewUrl(null);
                        if (mode !== "text") setActiveScript(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all
                        ${inputMode === mode
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              {inputMode === "text" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">Transcript</label>
                    {activeScript && (
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Demo script loaded
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={transcript}
                    onChange={e => { setTranscript(e.target.value); setActiveScript(null); }}
                    placeholder="Paste the full consultation transcript here, or select a demo script above…"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}

              {/* File input */}
              {inputMode === "file" && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Upload Transcript File</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    {selectedFile
                      ? <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      : <p className="text-sm text-muted-foreground">Click to upload <span className="font-medium text-foreground">.txt</span> or <span className="font-medium text-foreground">.docx</span></p>
                    }
                  </div>
                  <input ref={fileInputRef} type="file" accept=".txt,.docx" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {/* Video/Audio input */}
              {inputMode === "video" && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Upload Recording</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    {selectedFile
                      ? <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      : <>
                          <p className="text-sm text-muted-foreground">Click to upload a video or audio file</p>
                          <p className="text-xs text-muted-foreground mt-1">mp4 · mov · webm · mp3 · wav · m4a</p>
                        </>
                    }
                  </div>
                  <input ref={fileInputRef} type="file" accept=".mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.ogg" className="hidden" onChange={handleFileChange} />
                  {filePreviewUrl && (
                    <video src={filePreviewUrl} controls
                      className="mt-3 w-full rounded-lg border border-border max-h-48 object-contain bg-black" />
                  )}
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                    Gemini will transcribe and analyze the recording automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAnalyze}
                disabled={aiStatus === "loading"}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 min-w-[150px]"
              >
                {aiStatus === "loading"
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{loadingMsg}</>
                  : <><ChevronRight className="w-4 h-4" />Analyse Now</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="container py-8">

        {/* AI Summary */}
        {aiSummary && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" /> AI Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{aiSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard label="Empathy Score"    value={empathyScore} target={85} trend="up" />
          <MetricCard label="Clarity Score"    value={clarityScore} target={85} trend="up" />
          <MetricCard label="Engagement"       value={85}           target={85} trend="neutral" />
          <MetricCard label="Market Awareness" value={76}           target={80} trend="up" />
          <MetricCard label="Opportunity ID"   value={88}           target={85} trend="up" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Your key metrics over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="empathy"    stroke="var(--primary)"   strokeWidth={2} />
                  <Line type="monotone" dataKey="clarity"    stroke="var(--secondary)" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagement" stroke="var(--accent)"    strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Metrics</CardTitle>
              <CardDescription>Your performance snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={metricsData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" stroke="var(--muted-foreground)" />
                  <PolarRadiusAxis stroke="var(--muted-foreground)" />
                  <Radar name="Current" dataKey="value"  stroke="var(--primary)"   fill="var(--primary)"   fillOpacity={0.3} />
                  <Radar name="Target"  dataKey="target" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Tips */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-foreground">Personalised Coaching Suggestions</h2>
            {aiStatus === "success" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coachingTips.map((tip, i) => {
              const Icon = tipIcons[i % tipIcons.length];
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg shrink-0">
                        {Icon && <Icon className="w-5 h-5 text-secondary" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">Tip {i + 1}</CardTitle>
                        <Badge variant={i === 0 ? "destructive" : "secondary"} className="mt-1 text-xs">
                          {i === 0 ? "High Priority" : "Recommended"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{tip}</p>
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
              <CardDescription>Your last 3 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{s.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{s.date} • {s.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === "excellent"
                        ? <CheckCircle2 className="w-5 h-5 text-accent" />
                        : <AlertCircle  className="w-5 h-5 text-secondary" />
                      }
                      <span className="text-sm font-medium">{s.empathyScore}/100</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Sessions</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week's Summary</CardTitle>
              <CardDescription>Key statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatItem label="Average Empathy Score"   value={`${empathyScore}/100`} change="+4" positive />
                <StatItem label="Average Clarity Score"   value={`${clarityScore}/100`} change="+3" positive />
                <StatItem label="Average Engagement"      value="83/100" change="+2" positive />
                <StatItem label="Consultations Completed" value="4"      change="+1" positive />
                <StatItem label="Candidate Satisfaction"  value="4.5/5"  change="0"  neutral  />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Ready to Level Up?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You're on track to reach your targets! Focus on the coaching suggestions above to unlock your next achievement level.
            </p>
            <Button className="bg-primary hover:bg-primary/90">View Detailed Coaching Plan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, target, trend }: {
  label: string; value: number; target: number; trend: "up" | "down" | "neutral";
}) {
  const pct      = Math.round((value / target) * 100);
  const positive = value >= target * 0.95;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {trend === "up"   && <ArrowUp   className="w-4 h-4 text-accent" />}
          {trend === "down" && <ArrowDown className="w-4 h-4 text-destructive" />}
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">/ {target}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${positive ? "bg-accent" : "bg-secondary"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── StatItem ─────────────────────────────────────────────────────────────────
function StatItem({ label, value, change, positive, neutral }: {
  label: string; value: string; change: string; positive?: boolean; neutral?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">{value}</span>
        {positive && <span className="text-xs text-accent font-medium">{change}</span>}
        {neutral  && <span className="text-xs text-muted-foreground font-medium">{change}</span>}
      </div>
    </div>
  );
}