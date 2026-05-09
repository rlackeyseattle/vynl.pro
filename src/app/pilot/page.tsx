"use client";

import { useState } from "react";
import styles from "./Pilot.module.css";

export default function PilotPage() {
  const [radius, setRadius] = useState(150);
  const [minPay, setMinPay] = useState(200);
  const [status, setStatus] = useState("IDLE");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const launchPilot = async () => {
    setStatus("ACTIVE");
    addLog("Initializing Vynl Pilot...");
    
    try {
      const res = await fetch("/api/pilot/campaign", {
        method: "POST",
        body: JSON.stringify({
          userId: "current-user-id", // Should be fetched from session
          targetDates: ["2026-06-12", "2026-06-13"],
          maxRadius: radius,
          minCompensation: minPay
        })
      });
      const data = await res.json();
      addLog(`Campaign created. Found ${data.venuesFound} target venues.`);

      // Trigger outreach
      addLog("Starting automated outreach...");
      const processRes = await fetch("/api/pilot/process", {
        method: "POST",
        body: JSON.stringify({ campaignId: data.campaignId })
      });
      const processData = await processRes.json();
      processData.results.forEach((r: any) => addLog(`Email sent to ${r.venue}`));
      
    } catch (error) {
      addLog("Critical error during launch.");
      setStatus("IDLE");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.tag}>VYNL PILOT</span>
          <h1 className={styles.title}>Autonomous Booking Agent</h1>
        </div>
        <div className={styles.controls}>
          <button 
            className={status === "ACTIVE" ? styles.stopBtn : styles.startBtn}
            onClick={launchPilot}
          >
            {status === "ACTIVE" ? "Pause Pilot" : "Launch Pilot"}
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Constraints Panel */}
        <aside className={styles.panel}>
          <h2 className={styles.panelTitle}>Campaign Parameters</h2>
          
          <div className={styles.inputGroup}>
            <label>Search Radius ({radius} miles)</label>
            <input 
              type="range" 
              min="10" 
              max="500" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Min Compensation ($)</label>
            <input 
              type="number" 
              value={minPay} 
              onChange={(e) => setMinPay(parseInt(e.target.value))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Target Dates</label>
            <div className={styles.calendarPlaceholder}>
              [ Calendar Picker Component ]
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Email Voice</label>
            <select className={styles.select}>
              <option>Professional & Direct</option>
              <option>Casual & Enthusiastic</option>
              <option>Business Formal</option>
            </select>
          </div>
        </aside>

        {/* Activity Panel */}
        <main className={styles.activity}>
          <div className={styles.activityHeader}>
            <h2 className={styles.panelTitle}>Active Negotiations</h2>
            <span className={styles.pulse}></span>
          </div>

          <div className={styles.negotiationList}>
            {mockNegotiations.map((n, i) => (
              <div key={i} className={styles.negotiationCard}>
                <div className={styles.cardInfo}>
                  <h3>{n.venue}</h3>
                  <span className={styles.date}>{n.date}</span>
                </div>
                <div className={styles.cardStatus}>
                  <span className={styles[`status_${n.status.toLowerCase()}`]}>{n.status}</span>
                  <p className={styles.lastMsg}>"{n.lastMsg}"</p>
                </div>
                <button className={styles.viewBtn}>View Thread</button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Internal Log Section */}
      <section className={styles.log}>
        <h2 className={styles.panelTitle}>System Log (Internal)</h2>
        <div className={styles.logBox}>
          {logs.map((log, i) => <p key={i}>{log}</p>)}
          {logs.length === 0 && <p>Pilot ready for takeoff...</p>}
        </div>
      </section>
    </div>
  );
}
