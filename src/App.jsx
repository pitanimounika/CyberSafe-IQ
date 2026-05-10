import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, ChevronRight, ChevronLeft,
  RotateCcw, Home, Clock, Eye, EyeOff, Wifi, Lock,
  CheckCircle, XCircle, Terminal, Zap, Activity
} from "lucide-react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1, type: "mcq",
    scenario: "You receive a message from an unknown number saying: \"Your bank account is suspended. Send your OTP immediately to reactivate it.\"",
    question: "What is the safest action to take?",
    options: [
      "Send the OTP immediately to avoid account suspension",
      "Call your bank directly using the official number on their website",
      "Reply asking for more information before deciding",
      "Click the link provided in the message to check"
    ],
    correct: 1
  },
  {
    id: 2, type: "mcq",
    scenario: "While browsing, a popup appears: \"Congratulations! You've won a ₹50,000 Amazon voucher. Click NOW to claim before it expires!\"",
    question: "How should you respond?",
    options: [
      "Click immediately — this might be a real offer",
      "Share it with friends so they can also claim",
      "Close the popup and report the site as suspicious",
      "Enter your details to see if it's legitimate"
    ],
    correct: 2
  },
  {
    id: 3, type: "mcq",
    scenario: "A person you met online 3 days ago says they're in trouble and urgently needs your bank account details to transfer money temporarily.",
    question: "What do you do?",
    options: [
      "Help them since they seem trustworthy",
      "Send only your account number, not the IFSC",
      "Refuse and block/report the account",
      "Ask them to send money to you first as a trust test"
    ],
    correct: 2
  },
  {
    id: 4, type: "mcq",
    scenario: "You get an email from 'support@amazon-helpdesk-in.com' asking you to verify your account or it will be permanently deleted.",
    question: "Which is the correct response?",
    options: [
      "Verify immediately to protect your account",
      "Forward to friends to warn them",
      "Ignore it — Amazon emails always come from amazon.com",
      "Reply with your account details to verify"
    ],
    correct: 2
  },
  {
    id: 5, type: "mcq",
    scenario: "A classmate sends you a screenshot of someone's private conversation and asks you to share it in a group chat.",
    question: "What should you do?",
    options: [
      "Share it — it looks harmless",
      "Refuse to share and inform the person whose privacy was violated",
      "Share only with close friends",
      "Screenshot and post it on your own story"
    ],
    correct: 1
  },
  {
    id: 6, type: "written",
    scenario: "You receive a friend request from someone you've never met. Their profile has very few posts, no mutual friends, and they immediately start asking personal questions.",
    question: "How would you handle this situation and why?"
  },
  {
    id: 7, type: "written",
    scenario: "You're using public Wi-Fi at a café and you notice your banking app is asking you to log in again. Something feels off.",
    question: "Describe what steps you would take to stay safe."
  },
  {
    id: 8, type: "written",
    scenario: "A stranger online is being very friendly and slowly starts asking you for photos. You feel uncomfortable but don't want to seem rude.",
    question: "What would you do? How would you handle this safely?"
  },
  {
    id: 9, type: "written",
    scenario: "You created a strong password for your email, but your friend suggests using the same password everywhere since it's strong anyway.",
    question: "Do you agree with your friend? Explain your reasoning."
  },
  {
    id: 10, type: "written",
    scenario: "You notice that an app you installed is requesting permission to access your contacts, camera, microphone, and location — but it's just a flashlight app.",
    question: "How would you respond to these permission requests and why?"
  }
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function calcScore(answers) {
  let mcqScore = 0;
  QUESTIONS.forEach((q, i) => {
    if (q.type === "mcq" && answers[i] === q.correct) mcqScore++;
  });
  const writtenFilled = QUESTIONS.filter((q, i) => q.type === "written" && answers[i]?.trim().length > 10).length;
  const awareness = Math.round((mcqScore / 5) * 100);
  const responseQuality = Math.round((writtenFilled / 5) * 100);
  const total = Math.round((awareness * 0.6 + responseQuality * 0.4));
  return { mcqScore, writtenFilled, awareness, responseQuality, total };
}

function getLevel(total) {
  if (total >= 85) return { label: "Excellent", color: "#00f5c4", desc: "You demonstrate outstanding cyber safety awareness." };
  if (total >= 65) return { label: "Good", color: "#38bdf8", desc: "You have solid understanding of online safety practices." };
  if (total >= 45) return { label: "Average", color: "#f59e0b", desc: "You have basic awareness but room to improve." };
  return { label: "Needs Improvement", color: "#f87171", desc: "Consider learning more about cyber safety fundamentals." };
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,196,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,196,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px"
      }} />
      <div style={{
        position: "absolute", top: "20%", left: "10%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(0,245,196,0.06) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)"
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "10%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(60px)"
      }} />
    </div>
  );
}

function Navbar({ screen }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(4,10,20,0.8)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,245,196,0.1)",
      padding: "0 24px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={20} color="#00f5c4" />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#00f5c4", letterSpacing: 2 }}>
          CSRS
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5c4", animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(0,245,196,0.6)", letterSpacing: 1 }}>
          SYSTEM ACTIVE
        </span>
      </div>
    </nav>
  );
}

function TimerBar({ timeLeft, total = 30 }) {
  const pct = (timeLeft / total) * 100;
  const isLow = timeLeft <= 10;
  const color = isLow ? "#f87171" : timeLeft <= 20 ? "#f59e0b" : "#00f5c4";

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={14} color={color} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
            TIME REMAINING
          </span>
        </div>
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          style={{
            fontFamily: "'Space Mono', monospace", fontSize: 13, color,
            background: `rgba(${isLow ? "248,113,113" : "0,245,196"},0.1)`,
            padding: "2px 10px", borderRadius: 20,
            border: `1px solid ${color}30`
          }}
        >
          {timeLeft}s
        </motion.div>
      </div>
      <div style={{
        height: 4, borderRadius: 4,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden", position: "relative"
      }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "linear" }}
          style={{
            height: "100%", borderRadius: 4,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${color}80`,
            position: "absolute", left: 0
          }}
        />
      </div>
    </div>
  );
}

function ProgressTracker({ current, total }) {
  const pct = ((current) / total) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
          PROGRESS
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#38bdf8" }}>
          {current} / {total}
        </span>
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #00f5c4, #38bdf8)", boxShadow: "0 0 6px #00f5c450" }}
        />
      </div>
    </div>
  );
}

function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          style={{
            position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
            zIndex: 999, background: "rgba(248,113,113,0.15)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(248,113,113,0.4)", borderRadius: 12,
            padding: "10px 20px", display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 0 30px rgba(248,113,113,0.2)"
          }}
        >
          <AlertTriangle size={16} color="#f87171" />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#f87171" }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── SCREENS ────────────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        style={{ textAlign: "center", maxWidth: 600 }}
      >
        {/* Icon */}
        <motion.div
          animate={{ boxShadow: ["0 0 20px #00f5c430", "0 0 50px #00f5c460", "0 0 20px #00f5c430"] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            width: 90, height: 90, borderRadius: "50%",
            background: "rgba(0,245,196,0.08)", border: "2px solid rgba(0,245,196,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px"
          }}
        >
          <Shield size={40} color="#00f5c4" />
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#00f5c4", letterSpacing: 4, marginBottom: 16 }}>
            CYBER SAFETY PLATFORM
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 900, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #00f5c4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Cyber Safety<br />Response System
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
            A scenario-based assessment platform evaluating your awareness and decision-making in real-world cyber safety situations.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
        >
          {["10 Scenarios", "30s Per Question", "Instant Results"].map((tag, i) => (
            <div key={i} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              color: "rgba(56,189,248,0.8)", background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.2)", borderRadius: 20, padding: "6px 14px", letterSpacing: 1
            }}>{tag}</div>
          ))}
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,245,196,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          style={{
            fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 2,
            color: "#040a14", background: "linear-gradient(135deg, #00f5c4, #38bdf8)",
            border: "none", borderRadius: 12, padding: "16px 40px",
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10
          }}
        >
          START ASSESSMENT <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function InstructionsScreen({ onContinue }) {
  const items = [
    { icon: <Terminal size={16} />, text: "10 scenario-based questions total" },
    { icon: <Clock size={16} />, text: "30 seconds per scenario — timer auto-advances" },
    { icon: <CheckCircle size={16} />, text: "5 Multiple Choice + 5 Short Written responses" },
    { icon: <Lock size={16} />, text: "Answers are locked once you move to next scenario" },
    { icon: <Zap size={16} />, text: "Written responses limited to 30 words max" },
    { icon: <Activity size={16} />, text: "Your awareness and response quality will be scored" },
    { icon: <Shield size={16} />, text: "Stay focused — all scenarios are time-sensitive" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}
    >
      <div style={{ maxWidth: 640, width: "100%" }}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#38bdf8", letterSpacing: 4, marginBottom: 12 }}>
            BEFORE YOU BEGIN
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Assessment Guidelines
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 40 }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{
                background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
                padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12
              }}
            >
              <span style={{ color: "#00f5c4", marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ textAlign: "center" }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,245,196,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 2,
              color: "#040a14", background: "linear-gradient(135deg, #00f5c4, #38bdf8)",
              border: "none", borderRadius: 12, padding: "16px 40px",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10
            }}
          >
            BEGIN ASSESSMENT <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuestionScreen({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [timeLeft, setTimeLeft] = useState(30);
  const [locked, setLocked] = useState(false);
  const [writtenVal, setWrittenVal] = useState("");
  const timerRef = useRef(null);

  const q = QUESTIONS[current];

  // Timer
  useEffect(() => {
    setTimeLeft(30);
    setLocked(false);
    if (q.type === "written") {
      setWrittenVal(answers[current] || "");
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); advance(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const advance = useCallback(() => {
    clearInterval(timerRef.current);
    setLocked(true);
    setTimeout(() => {
      if (current < 9) setCurrent(c => c + 1);
      else {
        // save final written
        setAnswers(prev => {
          const updated = [...prev];
          if (q.type === "written") updated[current] = writtenVal;
          onComplete(updated);
          return updated;
        });
      }
    }, 400);
  }, [current, writtenVal, q]);

  const selectMCQ = (idx) => {
    if (locked) return;
    setAnswers(prev => { const a = [...prev]; a[current] = idx; return a; });
  };

  const handleWritten = (e) => {
    const val = e.target.value;
    const words = countWords(val);
    if (words <= 30) {
      setWrittenVal(val);
      setAnswers(prev => { const a = [...prev]; a[current] = val; return a; });
    }
  };

  const goNext = () => { if (!locked) advance(); };
  const goPrev = () => {
    if (current > 0 && !locked) {
      clearInterval(timerRef.current);
      setCurrent(c => c - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}
    >
      <div style={{ maxWidth: 680, width: "100%" }}>
        <ProgressTracker current={current + 1} total={10} />
        <TimerBar timeLeft={timeLeft} />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Scenario tag */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#00f5c4", letterSpacing: 3 }}>
                SCENARIO {String(current + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,245,196,0.15)" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {q.type === "mcq" ? "MCQ" : "WRITTEN"}
              </span>
            </div>

            {/* Scenario card */}
            <div style={{
              background: "rgba(0,245,196,0.04)", border: "1px solid rgba(0,245,196,0.12)",
              borderRadius: 16, padding: "20px 24px", marginBottom: 16,
              borderLeft: "3px solid #00f5c4"
            }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>
                {q.scenario}
              </p>
            </div>

            {/* Question */}
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
              {q.question}
            </p>

            {/* MCQ */}
            {q.type === "mcq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt, i) => {
                  const selected = answers[current] === i;
                  return (
                    <motion.button
                      key={i}
                      whileHover={!locked ? { x: 4 } : {}}
                      whileTap={!locked ? { scale: 0.99 } : {}}
                      onClick={() => selectMCQ(i)}
                      style={{
                        width: "100%", textAlign: "left",
                        background: selected ? "rgba(0,245,196,0.1)" : "rgba(255,255,255,0.03)",
                        border: selected ? "1px solid rgba(0,245,196,0.5)" : "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 12, padding: "14px 18px",
                        display: "flex", alignItems: "center", gap: 14,
                        cursor: locked ? "not-allowed" : "pointer",
                        transition: "all 0.2s", opacity: locked && !selected ? 0.5 : 1
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: selected ? "#00f5c4" : "rgba(255,255,255,0.06)",
                        border: selected ? "none" : "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: selected ? "#040a14" : "rgba(255,255,255,0.3)" }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: selected ? "#00f5c4" : "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Written */}
            {q.type === "written" && (
              <div style={{ position: "relative" }}>
                <motion.textarea
                  whileFocus={{ borderColor: "rgba(0,245,196,0.5)" }}
                  value={writtenVal}
                  onChange={handleWritten}
                  disabled={locked}
                  placeholder="Type your response here..."
                  style={{
                    width: "100%", minHeight: 140, resize: "vertical",
                    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                    padding: "16px 18px", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    color: "rgba(255,255,255,0.8)", lineHeight: 1.7,
                    boxSizing: "border-box", transition: "border-color 0.2s",
                    cursor: locked ? "not-allowed" : "text"
                  }}
                />
                <div style={{
                  position: "absolute", bottom: 12, right: 14,
                  fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)"
                }}>
                  {countWords(writtenVal)}/30
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <motion.button
            whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
            onClick={goPrev}
            disabled={current === 0 || locked}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1,
              color: current === 0 || locked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 18px", cursor: current === 0 || locked ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            <ChevronLeft size={16} /> PREV
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={goNext}
            disabled={locked}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1,
              color: "#040a14", background: locked ? "rgba(0,245,196,0.3)" : "linear-gradient(135deg, #00f5c4, #38bdf8)",
              border: "none", borderRadius: 10, padding: "10px 22px",
              cursor: locked ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            {current === 9 ? "SUBMIT" : "NEXT"} <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function CircleProgress({ value, size = 80, color = "#00f5c4", label }) {
  const r = 30, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto 8px" }}>
        <svg width={size} height={size} viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={c}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round" transform="rotate(-90 40 40)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color, fontWeight: 700 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </div>
  );
}

function ResultScreen({ answers, onRestart, onHome }) {
  const scores = calcScore(answers);
  const level = getLevel(scores.total);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}
    >
      <div style={{ maxWidth: 680, width: "100%" }}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#00f5c4", letterSpacing: 4, marginBottom: 12 }}>
            ASSESSMENT COMPLETE
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Your Results
          </h2>
        </motion.div>

        {/* Total score */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            background: `rgba(${level.color === "#00f5c4" ? "0,245,196" : level.color === "#38bdf8" ? "56,189,248" : level.color === "#f59e0b" ? "245,158,11" : "248,113,113"},0.06)`,
            border: `1px solid ${level.color}30`,
            borderRadius: 20, padding: "32px", textAlign: "center", marginBottom: 24,
            boxShadow: `0 0 60px ${level.color}15`
          }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
            style={{
              fontFamily: "'Syne', sans-serif", fontSize: 72, fontWeight: 900,
              color: level.color, lineHeight: 1, marginBottom: 8
            }}
          >
            {scores.total}
          </motion.div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 16 }}>
            TOTAL SCORE
          </div>
          <div style={{
            display: "inline-block", fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 2,
            color: level.color, background: `${level.color}15`,
            border: `1px solid ${level.color}40`, borderRadius: 20, padding: "6px 18px", marginBottom: 12
          }}>
            {level.label.toUpperCase()}
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            {level.desc}
          </p>
        </motion.div>

        {/* Circles */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "28px 20px", marginBottom: 20
          }}
        >
          <CircleProgress value={scores.awareness} color="#00f5c4" label="Awareness" />
          <CircleProgress value={scores.responseQuality} color="#38bdf8" label="Response Quality" />
          <CircleProgress value={scores.total} color={level.color} label="Overall" />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}
        >
          {[
            { label: "MCQ Correct", value: `${scores.mcqScore}/5`, color: "#00f5c4" },
            { label: "Written Responses", value: `${scores.writtenFilled}/5`, color: "#38bdf8" },
            { label: "Safety Rating", value: scores.total >= 65 ? "✓ SAFE" : "⚠ REVIEW", color: scores.total >= 65 ? "#00f5c4" : "#f59e0b" },
            { label: "Status", value: "COMPLETED", color: "#a78bfa" }
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "16px 20px"
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 8 }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ display: "flex", gap: 12, justifyContent: "center" }}
        >
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onHome}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1,
              color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 22px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8
            }}
          >
            <Home size={15} /> HOME
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(0,245,196,0.3)" }} whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1,
              color: "#040a14", background: "linear-gradient(135deg, #00f5c4, #38bdf8)",
              border: "none", borderRadius: 10, padding: "12px 24px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8
            }}
          >
            <RotateCcw size={15} /> RETAKE
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [finalAnswers, setFinalAnswers] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#040a14", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:wght@400;700&family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #040a14; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,196,0.3); border-radius: 2px; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
      <GridBg />
      <Navbar screen={screen} />
      <AnimatePresence mode="wait">
        {screen === "welcome" && <WelcomeScreen key="welcome" onStart={() => setScreen("instructions")} />}
        {screen === "instructions" && <InstructionsScreen key="instructions" onContinue={() => setScreen("quiz")} />}
        {screen === "quiz" && (
          <QuestionScreen key="quiz" onComplete={(ans) => { setFinalAnswers(ans); setScreen("result"); }} />
        )}
        {screen === "result" && (
          <ResultScreen
            key="result" answers={finalAnswers}
            onRestart={() => { setFinalAnswers(null); setScreen("quiz"); }}
            onHome={() => { setFinalAnswers(null); setScreen("welcome"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
