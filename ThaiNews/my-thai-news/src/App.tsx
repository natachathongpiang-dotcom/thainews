import { useState } from "react";
import "./App.css";
// นำเข้า Icon สวยๆ จาก Lucide แทนการใช้อีโมจิ
import { 
  FileEdit, 
  RotateCcw, 
  Rocket, 
  BarChart3, 
  History, 
  Inbox,
  ListVideo,
  Activity
} from "lucide-react";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // วิเคราะห์ข่าว
  const analyzeNews = async () => {
    if (!text) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          user_id: "user123",
        }),
      });

      const data = await res.json();
      setResult(data.result);

      const newItem = {
        id: Date.now(),
        text: text,
        category: data.result.filtered?.[0]?.category || "unknown",
        confidence: data.result.filtered?.[0]?.confidence || 0,
      };

      setHistory((prev) => [newItem, ...prev]);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const clearText = () => {
    setText("");
    setResult(null);
  };

  const filtered = result?.filtered || [];

  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div className="header">
        <div>
          <h2 className="gradient-text">Thai News Classification</h2>
          <p className="subtitle">ระบบแยกประเภทข่าวอัตโนมัติด้วยปัญญาประดิษฐ์</p>
        </div>
        <div className="status-badge">
          <span className="dot pulse"></span>
          Ready to analyze
        </div>
      </div>

      <div className="grid">
        {/* LEFT: Main Form */}
        <div className="card form-card">
          <div className="card-header">
            <h3>
              <FileEdit size={22} color="#3b82f6" /> 
              วิเคราะห์เนื้อหาข่าว
            </h3>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="วางเนื้อหาข่าวที่คุณต้องการวิเคราะห์ที่นี่..."
          />

          <div className="button-group">
            <button className="btn secondary" onClick={clearText}>
              <RotateCcw size={18} /> ล้างข้อความ
            </button>
            <button className="btn primary" onClick={analyzeNews} disabled={!text}>
              <Rocket size={18} /> วิเคราะห์ข่าว
            </button>
          </div>

          {/* Result Section */}
          <div className={`result-container ${result ? "has-result" : ""}`}>
            {result ? (
              <>
                <h4 className="result-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={22} color="#3b82f6" />
                  ผลการวิเคราะห์
                </h4>
                <div className="score-list">
                  {filtered.length > 0 ? (
                    filtered.map((item: any, index: number) => (
                      <div key={index} className="score-item">
                        <div className="score-info">
                          <span className="score-label">
                            <span className="rank-badge">#{index + 1}</span>{" "}
                            {item.category}
                          </span>
                          <span className="score-value">{item.confidence}%</span>
                        </div>
                        {/* Progress Bar หลอดพลัง */}
                        <div className="progress-bg">
                          <div
                            className="progress-fill"
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state small">
                      <Activity size={24} color="#94a3b8" />
                      <p>ไม่มีหมวดหมู่ที่ความมั่นใจเกิน 50%</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <BarChart3 size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <p>ผลการวิเคราะห์จะแสดงที่นี่</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: History */}
        <div className="side">
          <div className="card history-card">
            <div className="card-header">
              <h3>
                <History size={22} color="#64748b" />
                ประวัติล่าสุด
              </h3>
              <span className="history-count">{history.length} รายการ</span>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state small">
                  <Inbox size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p>ยังไม่มีประวัติการใช้งาน</p>
                </div>
              ) : (
                history.slice(0, 4).map((item) => (
                  <div key={item.id} className="history-item" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '4px' }}>
                      <ListVideo size={18} color="#94a3b8" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="history-header" style={{ marginBottom: '4px' }}>
                        <span className="tag">{item.category}</span>
                        <span className="history-score">{item.confidence}%</span>
                      </div>
                      <p className="history-text">{item.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}