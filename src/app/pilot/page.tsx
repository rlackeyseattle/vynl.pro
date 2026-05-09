"use client";

import { useState, useEffect } from "react";
import styles from "./Pilot.module.css";

export default function PilotPage() {
  const [radius, setRadius] = useState(150);
  const [minPay, setMinPay] = useState(200);
  const [status, setStatus] = useState("IDLE");
  const [logs, setLogs] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Poll for status every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pilot/status?userId=current-user-id");
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
          setNegotiations(data.campaign?.attempts || []);
          if (data.campaign) {
            setCampaignId(data.campaign.id);
            setStatus(data.campaign.status === "ACTIVE" ? "ACTIVE" : "IDLE");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const launchPilot = async () => {
    setStatus("ACTIVE");
    
    try {
      const res = await fetch("/api/pilot/campaign", {
        method: "POST",
        body: JSON.stringify({
          userId: "current-user-id",
          targetDates: ["2026-06-12", "2026-06-13"],
          maxRadius: radius,
          minCompensation: minPay
        })
      });
      const data = await res.json();
      setCampaignId(data.campaignId);

      // Trigger outreach
      await fetch("/api/pilot/process", {
        method: "POST",
        body: JSON.stringify({ campaignId: data.campaignId })
      });
      
    } catch (error) {
      console.error("Critical error during launch.", error);
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
            {status === "ACTIVE" ? "Pilot is Active" : "Launch Pilot"}
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
            {status === "ACTIVE" && <span className={styles.pulse}></span>}
          </div>

          <div className={styles.negotiationList}>
            {negotiations.map((n, i) => (
              <div key={i} className={styles.negotiationCard}>
                <div className={styles.cardInfo}>
                  <h3>{n.venue.name}</h3>
                  <span className={styles.date}>{n.venue.address || "Location TBD"}</span>
                </div>
                <div className={styles.cardStatus}>
                  <span className={styles[`status_${n.status.toLowerCase()}`]}>{n.status}</span>
                  <p className={styles.lastMsg}>{n.negotiationLog?.split('\n').pop() || "Waiting for response..."}</p>
                </div>
                <button className={styles.viewBtn}>Manage</button>
              </div>
            ))}
            {negotiations.length === 0 && (
              <div className={styles.empty}>
                No active negotiations. Launch the Pilot to begin outreach.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Internal Log Section */}
      <section className={styles.log}>
        <h2 className={styles.panelTitle}>System Intelligence (Internal)</h2>
        <div className={styles.logBox}>
          {logs.map((log, i) => (
            <p key={i} className={styles[`log_${log.level.toLowerCase()}`]}>
              [{new Date(log.createdAt).toLocaleTimeString()}] {log.message}
            </p>
          ))}
          {logs.length === 0 && <p>Pilot ready for takeoff...</p>}
        </div>
      </section>
    </div>
  );
}
