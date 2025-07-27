import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";

const colors = {
  background: "#10181e",
  card: "#19222c",
  primary: "#00ffe1",
  secondary: "#1385ff",
  accent: "#ff3570",
  safe: "#44feac",
  warning: "#ffae3a",
  danger: "#ff3570",
  text: "#f3f7fa",
  muted: "#a7b6c6",
  border: "#293546",
};

const scoreColor = (val) =>
  val === "Error"
    ? colors.danger
    : val >= 4
    ? colors.safe
    : val >= 2
    ? colors.warning
    : colors.danger;

function Popup() {
  const [activeTab, setActiveTab] = useState("scan");
  const [url, setUrl] = useState("");
  const [riskScore, setRiskScore] = useState(null);
  const [geminiText, setGeminiText] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  const [trustScore, setTrustScore] = useState(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [trustLoading, setTrustLoading] = useState(false);

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const taburl = tabs[0].url || "";
      setUrl(taburl);
      fetchTrust(taburl);
      fetchScan(taburl);
    });
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  function fetchTrust(taburl) {
    setTrustLoading(true);
    fetch(`http://localhost:5000/trust-score?url=${encodeURIComponent(taburl)}`)
      .then((res) => res.json())
      .then((data) => {
        setTrustScore(data.averageRating !== null ? data.averageRating.toFixed(2) : null);
        setFeedbackCount(data.feedbackCount || 0);
        setTrustLoading(false);
      })
      .catch(() => {
        setTrustScore("Error");
        setTrustLoading(false);
      });
  }

  function fetchScan(taburl) {
    setScanLoading(true);
    fetch("http://localhost:5000/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: taburl }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRiskScore(data.riskScore);
        setGeminiText(data.geminiAnalysis || "");
        setScanLoading(false);
      })
      .catch(() => {
        setRiskScore("Error");
        setGeminiText("Error fetching AI analysis.");
        setScanLoading(false);
      });
  }

  function handleFeedback() {
    setStatus("");
    if (!rating) {
      setStatus("Please select a rating.");
      return;
    }
    fetch("http://localhost:5000/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, rating: Number(rating), comment }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("Thanks for your feedback!");
          setRating("");
          setComment("");
          fetchTrust(url);
        } else {
          setStatus("Failed to submit feedback.");
        }
      })
      .catch(() => setStatus("Error submitting feedback."));
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    const msg = { sender: "user", text: chatInput.trim() };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
    setChatLoading(true);

    fetch("http://localhost:5000/scamgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg.text, url }),
    })
      .then((res) => res.json())
      .then((data) => {
        const reply = { sender: "bot", text: data.reply || "No response." };
        setChatMessages((prev) => [...prev, reply]);
      })
      .catch(() =>
        setChatMessages((prev) => [...prev, { sender: "bot", text: "Error contacting ScamGPT." }])
      )
      .finally(() => setChatLoading(false));
  }

  function renderTab() {
    const tabStyle = {
      opacity: 0,
      transform: "translateY(10px)",
      animation: "fadeInUp 0.5s ease-out forwards",
    };

    switch (activeTab) {
      case "scan":
        return (
          <div style={tabStyle}>
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.card} 0%, #1a2532 100%)`,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${colors.border}`,
                marginBottom: 16,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(0, 255, 225, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 30px rgba(0, 255, 225, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 20px rgba(0, 255, 225, 0.1)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, ${colors.danger}, ${colors.warning}, ${colors.danger})`,
                  backgroundSize: "200% 100%",
                  animation: riskScore > 70 ? "pulse 2s ease-in-out infinite" : "none",
                }}
              />
              {scanLoading ? (
                <div style={{ color: colors.muted, animation: "pulse 1.5s ease-in-out infinite" }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>🔍</div>
                  Scanning...
                </div>
              ) : riskScore === "Error" ? (
                <div style={{ color: colors.danger }}>Error loading scan</div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: riskScore > 70 ? colors.danger : riskScore > 30 ? colors.warning : colors.safe,
                      marginBottom: 8,
                      textShadow: `0 0 20px ${riskScore > 70 ? colors.danger : riskScore > 30 ? colors.warning : colors.safe}40`,
                      animation: "countUp 1s ease-out",
                    }}
                  >
                    {riskScore == null ? "--" : `${riskScore}`}
                    <span style={{ fontSize: 16, opacity: 0.7 }}> / 100</span>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: riskScore > 70 ? colors.danger : riskScore > 30 ? colors.warning : colors.safe,
                      marginBottom: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {riskScore > 70
                      ? "⚠️ Unsafe / Scam Likely"
                      : riskScore > 30
                      ? "⚠️ Caution Advised"
                      : "✔️ Safe"}
                  </div>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
                      color: colors.text,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 12,
                      border: `1px solid ${colors.border}`,
                      textAlign: "left",
                      maxHeight: 80,
                      overflowY: "auto",
                      lineHeight: 1.4,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #151c23 0%, #1f2633 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)";
                    }}
                  >
                    {geminiText}
                  </div>
                </>
              )}
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
                padding: 12,
                borderRadius: 8,
                fontSize: 11,
                color: colors.muted,
                border: `1px dashed ${colors.secondary}`,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 15px ${colors.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = colors.secondary;
                e.target.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>🔗</span>
                <div>
                  <b style={{ color: colors.text }}>URL:</b>
                  <div style={{ wordBreak: "break-all", marginTop: 4 }}>{url}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "community":
        return (
          <div style={tabStyle}>
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.card} 0%, #1a2532 100%)`,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 20,
                marginBottom: 16,
                textAlign: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(0, 255, 225, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 8px 30px rgba(0, 255, 225, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 20px rgba(0, 255, 225, 0.1)";
              }}
            >
              <div
                style={{
                  fontSize: trustScore === "Error" ? 20 : 36,
                  fontWeight: 800,
                  color: scoreColor(trustScore),
                  marginBottom: 8,
                  textShadow: `0 0 20px ${scoreColor(trustScore)}40`,
                  animation: "countUp 1s ease-out",
                }}
              >
                {trustLoading ? (
                  <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>...</span>
                ) : trustScore === "Error" ? (
                  "Error"
                ) : trustScore === null ? (
                  "No feedback"
                ) : (
                  trustScore
                )}
                <span style={{ fontSize: 14, color: colors.muted }}>
                  {!(trustLoading || trustScore === "Error") ? " / 5" : ""}
                </span>
              </div>
              <div 
                style={{ 
                  fontSize: 13, 
                  color: colors.muted,
                  animation: "fadeIn 0.8s ease-out 0.3s both"
                }}
              >
                {trustLoading ? "" : ` (${feedbackCount} feedback${feedbackCount !== 1 ? "s" : ""})`}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 4,
                  marginTop: 12,
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: 16,
                      color: star <= Math.round(trustScore) ? colors.warning : colors.border,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.2)";
                      e.target.style.filter = "brightness(1.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.filter = "brightness(1)";
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: colors.text,
                marginBottom: 8,
                textAlign: "center",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Community Trust Score
            </div>
            <div
              style={{
                fontSize: 11,
                color: colors.muted,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {trustScore === null && "No users have rated this site yet."}
            </div>
          </div>
        );

      case "feedback":
        return (
          <div style={tabStyle}>
            <div style={{ marginTop: 6 }}>
              <div 
                style={{ 
                  marginBottom: 20, 
                  textAlign: "center",
                  animation: "fadeInDown 0.6s ease-out"
                }}
              >
                <span 
                  style={{ 
                    color: colors.primary, 
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textShadow: `0 0 10px ${colors.primary}40`
                  }}
                >
                  Give Your Trust Rating
                </span>
              </div>
              <div 
                style={{ 
                  marginBottom: 16,
                  animation: "slideInLeft 0.6s ease-out 0.1s both"
                }}
              >
                <label style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                  Rating:{" "}
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{
                    marginLeft: 8,
                    background: "#1f2940",
                    color: colors.text,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 14,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 15px ${colors.primary}30`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="" style={{ background: "#1f2940", color: colors.text }}>Select Rating</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v} style={{ background: "#1f2940", color: colors.text }}>
                      {v} Star{v !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Leave a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 16,
                  padding: 12,
                  background: "linear-gradient(135deg, #131b28 0%, #1a2332 100%)",
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 10,
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  animation: "slideInRight 0.6s ease-out 0.2s both",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.secondary;
                  e.target.style.boxShadow = `0 0 15px ${colors.secondary}30`;
                  e.target.style.transform = "scale(1.02)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "scale(1)";
                }}
              />
              <button
                onClick={handleFeedback}
                style={{
                  width: "100%",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #00d4b8 100%)`,
                  color: "#0a0f13",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 0",
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: 1,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: `0 4px 20px ${colors.primary}30`,
                  animation: "slideInUp 0.6s ease-out 0.3s both",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px) scale(1.02)";
                  e.target.style.boxShadow = `0 8px 30px ${colors.primary}50`;
                  e.target.style.background = `linear-gradient(135deg, #00d4b8 0%, ${colors.primary} 100%)`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow = `0 4px 20px ${colors.primary}30`;
                  e.target.style.background = `linear-gradient(135deg, ${colors.primary} 0%, #00d4b8 100%)`;
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = "translateY(1px) scale(0.98)";
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = "translateY(-2px) scale(1.02)";
                }}
              >
                Submit Feedback
              </button>
              {status && (
                <div
                  style={{
                    color: status.includes("error") || status.includes("Error") ? colors.danger : colors.safe,
                    margin: "12px 0",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: status.includes("error") || status.includes("Error") 
                      ? `${colors.danger}15` 
                      : `${colors.safe}15`,
                    border: `1px solid ${status.includes("error") || status.includes("Error") ? colors.danger : colors.safe}40`,
                    animation: "bounceIn 0.5s ease-out",
                  }}
                >
                  {status}
                </div>
              )}
            </div>
          </div>
        );

      case "scamgpt":
        return (
          <div style={tabStyle}>
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.card} 0%, #1a2532 100%)`,
                borderRadius: 10,
                padding: 8,
                border: `1px solid ${colors.border}`,
                maxHeight: 130,
                overflowY: "auto",
                marginBottom: 12,
                transition: "all 0.3s ease",
                boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {chatMessages.length === 0 && (
                <div
                  style={{
                    fontStyle: "italic",
                    color: colors.muted,
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                >
                  Ask ScamGPT anything about scams, phishing, suspicious sites.
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                    marginBottom: 6,
                    animation: `slideIn${msg.sender === "user" ? "Right" : "Left"} 0.4s ease-out`,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background: msg.sender === "user"
                        ? `linear-gradient(135deg, ${colors.primary} 0%, #00d4b8 100%)`
                        : `linear-gradient(135deg, ${colors.secondary} 0%, #0f6fd9 100%)`,
                      color: "#0a0f13",
                      borderRadius: 15,
                      padding: "6px 12px",
                      maxWidth: "85%",
                      fontSize: 12,
                      margin: "2px 0",
                      fontWeight: 600,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxShadow: msg.sender === "user" 
                        ? `0 2px 10px ${colors.primary}30`
                        : `0 2px 10px ${colors.secondary}30`,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.02)";
                      e.target.style.boxShadow = msg.sender === "user" 
                        ? `0 4px 15px ${colors.primary}50`
                        : `0 4px 15px ${colors.secondary}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = msg.sender === "user" 
                        ? `0 2px 10px ${colors.primary}30`
                        : `0 2px 10px ${colors.secondary}30`;
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <textarea
              rows={2}
              value={chatInput}
              maxLength={220}
              disabled={chatLoading}
              placeholder="Type your question to ScamGPT..."
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #131b28 0%, #1a2332 100%)",
                color: colors.text,
                border: `2px solid ${colors.border}`,
                borderRadius: 10,
                padding: 10,
                fontSize: 13,
                fontFamily: "inherit",
                marginBottom: 8,
                resize: "none",
                transition: "all 0.3s ease",
                opacity: chatLoading ? 0.7 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.secondary;
                e.target.style.boxShadow = `0 0 15px ${colors.secondary}30`;
                e.target.style.transform = "scale(1.01)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
                e.target.style.transform = "scale(1)";
              }}
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: "100%",
                background: chatLoading || !chatInput.trim() 
                  ? "linear-gradient(135deg, #2a3441 0%, #1f2b38 100%)"
                  : `linear-gradient(135deg, ${colors.primary} 0%, #00d4b8 100%)`,
                color: chatLoading || !chatInput.trim() ? colors.muted : "#0a0f13",
                border: "none",
                borderRadius: 10,
                padding: "10px 0",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 1,
                cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                boxShadow: chatLoading || !chatInput.trim() 
                  ? "none" 
                  : `0 4px 20px ${colors.primary}30`,
              }}
              onMouseEnter={(e) => {
                if (!chatLoading && chatInput.trim()) {
                  e.target.style.transform = "translateY(-2px) scale(1.02)";
                  e.target.style.boxShadow = `0 8px 30px ${colors.primary}50`;
                }
              }}
              onMouseLeave={(e) => {
                if (!chatLoading && chatInput.trim()) {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow = `0 4px 20px ${colors.primary}30`;
                }
              }}
            >
              {chatLoading ? (
                <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
                  🤖 Processing...
                </span>
              ) : (
                "🚀 Ask ScamGPT"
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.background} 50%, #0f1419 100%)`,
        color: colors.text,
        fontFamily: "'Segoe UI', 'Montserrat', 'Roboto', Arial, sans-serif",
        width: 330,
        minHeight: 420,
        padding: 0,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `
          0 0 40px ${colors.primary}20,
          0 0 80px ${colors.secondary}10,
          0 2px 16px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        userSelect: "none",
        margin: "20px auto",
        position: "relative",
        animation: "slideInUp 0.6s ease-out",
      }}
    >
      {/* Animated background overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${colors.primary}15 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${colors.secondary}15 0%, transparent 50%)
          `,
          animation: "backgroundPulse 4s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />

      {/* Top tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${colors.border}`,
          background: `linear-gradient(135deg, ${colors.card} 0%, #1a2431 100%)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {[
          { id: "scan", label: "Scanner", icon: "🔎" },
          { id: "community", label: "Community", icon: "🌐" },
          { id: "feedback", label: "Feedback", icon: "📝" },
          { id: "scamgpt", label: "ScamGPT", icon: "🤖" },
        ].map((tab, index) => (
          <div
            key={tab.id}
            title={tab.label}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              fontWeight: 700,
              color: activeTab === tab.id ? colors.primary : colors.muted,
              padding: "14px 0 10px",
              fontSize: 15,
              borderBottom: activeTab === tab.id
                ? `3px solid ${colors.primary}`
                : "3px solid transparent",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              letterSpacing: 0.4,
              userSelect: "none",
              background: activeTab === tab.id 
                ? `linear-gradient(135deg, #151c23 0%, #1a242f 100%)`
                : "transparent",
              position: "relative",
              transform: activeTab === tab.id ? "translateY(-1px)" : "translateY(0)",
              animation: `tabFadeIn 0.5s ease-out ${index * 0.1}s both`,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = colors.text;
                e.target.style.transform = "translateY(-2px) scale(1.05)";
                e.target.style.background = `linear-gradient(135deg, #1a252f 0%, #1f2938 100%)`;
                e.target.style.boxShadow = `0 4px 15px ${colors.primary}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = colors.muted;
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.background = "transparent";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 4,
                transition: "all 0.3s ease",
                animation: activeTab === tab.id ? "iconBounce 0.6s ease-out" : "none",
              }}
            >
              {tab.icon}
            </div>
            <div style={{ fontSize: 10, textTransform: "uppercase" }}>
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60%",
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "2px 2px 0 0",
                  boxShadow: `0 0 10px ${colors.primary}`,
                  animation: "glowPulse 2s ease-in-out infinite alternate",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Tab content container */}
      <div
        style={{
          padding: 16,
          minHeight: 350,
          maxHeight: 350,
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {renderTab()}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: colors.muted,
          borderTop: `1px solid ${colors.border}`,
          padding: "8px 0",
          letterSpacing: 0.5,
          background: `linear-gradient(135deg, #0f1419 0%, #1a242f 100%)`,
          userSelect: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            animation: "fadeIn 1s ease-out 0.5s both",
          }}
        >
          <span
            style={{
              color: colors.primary,
              fontWeight: 800,
              textShadow: `0 0 10px ${colors.primary}40`,
              animation: "textGlow 3s ease-in-out infinite alternate",
            }}
          >
            SAFE WEBTRUST
          </span>
          <span style={{ fontSize: 8, opacity: 0.6 }}>•</span>
          <span style={{ fontSize: 10 }}>Secure by AI & Community</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes countUp {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes iconBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }

        @keyframes glowPulse {
          from {
            box-shadow: 0 0 5px ${colors.primary};
          }
          to {
            box-shadow: 0 0 15px ${colors.primary}, 0 0 25px ${colors.primary}40;
          }
        }

        @keyframes textGlow {
          from {
            text-shadow: 0 0 10px ${colors.primary}40;
          }
          to {
            text-shadow: 0 0 20px ${colors.primary}60, 0 0 30px ${colors.primary}40;
          }
        }

        @keyframes backgroundPulse {
          from {
            opacity: 0.3;
          }
          to {
            opacity: 0.6;
          }
        }

        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Popup />);