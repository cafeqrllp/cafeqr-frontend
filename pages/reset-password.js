import { useState } from "react";
import { useRouter } from "next/router";
import { getApiUrl } from "../utils/api";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMsgType("error");
      setMsg("❌ Invalid or missing reset token.");
      return;
    }

    if (newPw.length < 6) {
      setMsgType("error");
      setMsg("❌ Password must be ≥6 characters.");
      return;
    }
    
    if (newPw !== confirmPw) {
      setMsgType("error");
      setMsg("❌ Passwords do not match.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword: newPw }),
      });

      if (!response.ok) {
        throw new Error("Reset failed. Token may be invalid or expired.");
      }

      setMsgType("success");
      setMsg("✅ Password updated successfully! Redirecting to login...");

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMsgType("error");
      setMsg(`❌ ${err?.message || "An error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="mobile-card">
        <div className="header-graphic">
          <div className="circle-overlay" />
          <div className="header-content">
            <button className="back-btn" onClick={() => router.push('/login')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1>Reset<br/>Password</h1>
          </div>
        </div>

        <div className="form-body">
          <form onSubmit={onSubmit}>
            
            <div className="input-group">
              <input
                type="password"
                id="newPw"
                className={newPw ? "has-content" : ""}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={6}
                placeholder=" "
                disabled={loading}
              />
              <label htmlFor="newPw">New Password</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="confirmPw"
                className={confirmPw ? "has-content" : ""}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                minLength={6}
                placeholder=" "
                disabled={loading}
              />
              <label htmlFor="confirmPw">Confirm Password</label>
            </div>

            {msg && <div className={`alert ${msgType}`}>{msg}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "UPDATING..." : "RESET PASSWORD"}
            </button>

            <div className="copyright-footer">&copy; 2026 ALL RIGHTS RESERVED</div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        body { background: #e2e8f0; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: #cbd5e1; padding: 20px;
        }
        .mobile-card {
           width: 100%; max-width: 950px; height: 550px;
           background: white; border-radius: 32px;
           overflow: hidden; box-shadow: 0 40px 80px -20px rgba(0,0,0,0.2);
           display: flex; flex-direction: row;
        }
        .header-graphic {
          width: 45%; height: 100%;
          background: #115e59;
          position: relative; overflow: hidden;
        }
        .circle-overlay {
          position: absolute; top: -100px; right: -100px;
          width: 320px; height: 320px;
          background: #f97316; border-radius: 50%;
        }
        .header-content {
          position: relative; z-index: 2; padding: 60px 40px; height: 100%;
          display: flex; flex-direction: column; justify-content: center;
        }
        .header-content h1 { font-size: 42px; margin: 0; color: white; line-height: 1.2; font-weight: 800; }
        .back-btn {
          position: absolute; top: 30px; left: 30px;
          background: transparent; border: none; padding: 0; cursor: pointer;
        }
        .form-body {
          flex: 1; padding: 60px;
          display: flex; flex-direction: column; justify-content: center;
          background: white;
        }
        form { width: 100%; max-width: 360px; margin: 0 auto; }
        .input-group { margin-bottom: 32px; position: relative; }
        .input-group input {
           display: block; width: 100%;
           padding: 12px 0;
           font-family: 'Plus Jakarta Sans', sans-serif;
           font-weight: 500;
           font-size: 16px; 
           border: none; border-bottom: 2px solid #cbd5e1;
           background: transparent !important;
           border-radius: 0; color: #1e293b;
           outline: none; transition: all 0.2s;
           box-shadow: none !important;
        }
        .input-group input:focus { border-bottom-color: #f97316; }
        .input-group label {
          position: absolute; top: 12px; left: 0;
          font-size: 16px; color: #94a3b8;
          pointer-events: none; transition: all 0.2s ease;
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label,
        .input-group input.has-content + label {
          top: -8px; font-size: 12px; color: #115e59; font-weight: 600;
        }
        .submit-btn {
          width: 100%; padding: 16px;
          background: #f97316; color: white;
          border: none; border-radius: 12px;
          font-size: 14px; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; text-transform: uppercase;
          box-shadow: 0 10px 20px -5px rgba(249, 115, 22, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .alert {
          font-size: 13px; border-radius: 8px;
          padding: 12px; margin-bottom: 24px; line-height: 1.4;
        }
        .alert.error { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
        .alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
        .copyright-footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #94a3b8;
          letter-spacing: 1px;
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .page-wrapper { padding: 0; align-items: flex-start; background: #fff; }
          .mobile-card {
            flex-direction: column; height: 100%; min-height: 100vh;
            max-width: none; border-radius: 0; box-shadow: none;
          }
          .header-graphic {
            width: 100%; height: 280px; flex: none;
            border-bottom-left-radius: 50px; border-bottom-right-radius: 50px;
          }
          .circle-overlay { top: -60px; right: -60px; width: 220px; height: 220px; }
          .header-content { justify-content: flex-start; padding-top: 60px; }
          .form-body { padding: 40px 30px; justify-content: flex-start; }
          form { max-width: none; margin: 0; }
        }
      `}</style>
    </div>
  );
}
