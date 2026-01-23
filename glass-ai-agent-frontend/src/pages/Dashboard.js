// import { useEffect, useState } from "react";
// import PageWrapper from "../components/PageWrapper";
// import dashboardBg from "../assets/dashboard-bg.jpg";
// import api from "../api/api";


// function Dashboard() {
//   const role = localStorage.getItem("role");
//   const [auditLogs, setAuditLogs] = useState([]);

//   useEffect(() => {
//     if (role !== "ROLE_ADMIN") return;

//     api
//       .get("/stock/recent")
//       .then((res) => {
//         setAuditLogs(res.data.slice(0, 3));
//       })
//       .catch(() => {
//         console.log("Audit logs not allowed for this role");
//       });
//   }, [role]);

//   return (
//     <PageWrapper background={dashboardBg}>
//       <div style={centerWrapper}>
//         <div style={glassCard}>
//           <h1 style={title}>📊 Glass Shop Dashboard</h1>

//           <p style={subtitle}>
//             Welcome to your smart inventory management system
//           </p>

//           <div style={quickInfo}>
//             <span>✔ Real-time Stock</span>
//             <span>✔ AI Assistance</span>
//             <span>✔ Easy Management</span>
//           </div>

//           {/* 🔐 ADMIN ONLY */}
//           {role === "ROLE_ADMIN" && (
//             <div style={auditCard}>
//               <div style={auditHeader}>
//                 <h3 style={{ margin: 0 }}>🧾 Recent Stock Activity</h3>
//                 <span style={auditSub}>Last 3 updates</span>
//               </div>

//               {auditLogs.length === 0 ? (
//                 <p style={{ textAlign: "center", opacity: 0.7 }}>
//                   No recent activity
//                 </p>
//               ) : (
//                 auditLogs.map((log, i) => (
//                   <div key={i} style={auditItem}>
//                     <div style={avatar}>
//                       {log.username?.charAt(0).toUpperCase()}
//                     </div>

//                     <div style={auditContent}>
//                       <div style={auditTop}>
//                         <strong>{log.username}</strong>
//                         <span style={badge(log.action)}>
//                           {log.action}
//                         </span>
//                       </div>

//                       <div style={auditMid}>
//                         <span>
//                           <b>{log.quantity}</b> × {log.glassType}
//                         </span>
//                         <span style={{ marginLeft: 10, opacity: 0.8 }}>
//                           Stand #{log.standNo}
//                         </span>
//                       </div>

//                       <div style={auditSize}>
//                         Size: {log.height} × {log.width} {log.unit}
//                       </div>

//                       <div style={auditBottom}>
//                         Role: {log.role} •{" "}
//                         {new Date(log.timestamp).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </PageWrapper>
//   );
// }

// /* ---------- STYLES ---------- */

// const centerWrapper = {
//   minHeight: "calc(100vh - 60px)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// };

// const glassCard = {
//   width: "650px",
//   padding: "40px",
//   borderRadius: "16px",
//   background: "rgba(0, 0, 0, 0.45)",
//   backdropFilter: "blur(14px)",
//   color: "white",
//   textAlign: "center",
//   boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
// };

// const title = {
//   fontSize: "32px",
//   marginBottom: "10px",
// };

// const subtitle = {
//   fontSize: "16px",
//   opacity: 0.9,
//   marginBottom: "25px",
// };

// const quickInfo = {
//   display: "flex",
//   justifyContent: "space-around",
//   fontSize: "14px",
//   opacity: 0.85,
// };

// const auditCard = {
//   marginTop: "35px",
//   padding: "25px",
//   background: "linear-gradient(145deg, rgba(0,0,0,0.7), rgba(25,25,25,0.7))",
//   borderRadius: "18px",
// };

// const auditHeader = {
//   display: "flex",
//   justifyContent: "space-between",
//   marginBottom: "20px",
// };

// const auditSub = {
//   fontSize: "12px",
//   opacity: 0.7,
// };

// const auditItem = {
//   display: "flex",
//   gap: "14px",
//   padding: "14px",
//   borderRadius: "14px",
//   background: "rgba(255,255,255,0.06)",
//   marginBottom: "14px",
// };

// const avatar = {
//   width: "42px",
//   height: "42px",
//   borderRadius: "50%",
//   background: "linear-gradient(135deg, #22c55e, #16a34a)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontWeight: "700",
// };

// const auditContent = { flex: 1 };

// const auditTop = {
//   display: "flex",
//   justifyContent: "space-between",
// };

// const auditMid = { fontSize: "14px" };

// const auditSize = { fontSize: "13px", opacity: 0.85 };

// const auditBottom = { fontSize: "12px", opacity: 0.65 };

// const badge = (action) => ({
//   padding: "4px 10px",
//   borderRadius: "999px",
//   fontSize: "12px",
//   fontWeight: "600",
//   color: "white",
//   background:
//     action === "ADD"
//       ? "linear-gradient(135deg, #22c55e, #16a34a)"
//       : "linear-gradient(135deg, #ef4444, #dc2626)",
// });

// export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import dashboardBg from "../assets/dashboard-bg.jpg";
import api from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalStock: 0,
    totalTransfers: 0,
    totalStaff: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [billingMenuOpen, setBillingMenuOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load stock data (for both admin and staff)
        const stockPromise = api.get("/stock/all")
          .then(res => res.data)
          .catch(() => []);

        // Load staff data (only for admin)
        const staffPromise = role === "ROLE_ADMIN"
          ? api.get("/auth/staff")
            .then(res => res.data)
            .catch(() => [])
          : Promise.resolve([]);

        // Load audit logs (only for admin) - for activity logs count
        const auditPromise = role === "ROLE_ADMIN"
          ? api.get("/audit/recent")
            .then(res => res.data)
            .catch(() => [])
          : Promise.resolve([]);

        // Load recent stock activity (only for admin) - for Recent Stock Activity section
        const recentStockActivityPromise = role === "ROLE_ADMIN"
          ? api.get("/stock/recent")
            .then(res => res.data)
            .catch(() => [])
          : Promise.resolve([]);

        // Load transfer count (for both admin and staff)
        const transferCountPromise = api.get("/audit/transfer-count")
          .then(res => {
            console.log("Transfer count response:", res.data);
            const count = res.data;
            // Ensure it's a number
            return typeof count === 'number' ? count : (typeof count === 'string' ? parseInt(count, 10) : 0);
          })
          .catch((error) => {
            console.error("Error fetching transfer count:", error);
            // For admin, fallback to counting from auditData
            if (role === "ROLE_ADMIN") {
              console.log("Falling back to counting transfers from audit logs");
              return null; // Will be handled below
            }
            return 0;
          });

        // Wait for all API calls
        const [stockData, staffData, auditData, transferCount, recentStockActivity] = await Promise.all([
          stockPromise,
          staffPromise,
          auditPromise,
          transferCountPromise,
          recentStockActivityPromise,
        ]);

        // Set recent stock activity (last 3) - only for admin
        if (role === "ROLE_ADMIN") {
          setAuditLogs(Array.isArray(recentStockActivity) ? recentStockActivity.slice(0, 3) : []);
        }

        // Calculate stats
        // Total stock: count of unique stock items (stands) - for both admin and staff
        const totalStock = Array.isArray(stockData) ? stockData.length : 0;
        
        // Total staff: count of staff members - only for admin
        const totalStaff = role === "ROLE_ADMIN" && Array.isArray(staffData) ? staffData.length : 0;
        
        // Total transfers: use transfer count from API, but verify with audit logs if API returns 0
        let totalTransfers = 0;
        
        // If API call succeeded and returned a number, use it
        if (transferCount !== null && typeof transferCount === 'number') {
          totalTransfers = transferCount;
          
          // If API returned 0, double-check with audit logs (in case API has issues)
          if (transferCount === 0 && role === "ROLE_ADMIN" && Array.isArray(auditData)) {
            const auditTransferCount = auditData.filter(log => log && log.action === "TRANSFER").length;
            if (auditTransferCount > 0) {
              console.log("API returned 0 but audit logs show transfers. Using audit log count:", auditTransferCount);
              totalTransfers = auditTransferCount;
            }
          }
        } else {
          // API call failed - use fallback from audit logs
          if (role === "ROLE_ADMIN" && Array.isArray(auditData)) {
            totalTransfers = auditData.filter(log => log && log.action === "TRANSFER").length;
            console.log("API failed. Using fallback transfer count from audit logs:", totalTransfers);
          }
        }
        
        // Total logs: count all audit logs - only for admin
        const totalLogs = role === "ROLE_ADMIN" && Array.isArray(auditData) ? auditData.length : 0;

        setStats({
          totalStock,
          totalTransfers,
          totalStaff,
          totalLogs,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role]);

  return (
    <PageWrapper background={dashboardBg}>
      <div style={page}>
        <div style={container}>
          {/* Header */}
          <div style={header}>
            <h1 style={title}>📊 Dashboard</h1>
            <p style={subtitle}>
              Welcome to your smart inventory management system
            </p>
          </div>

              {/* Quick Actions - Billing (ADMIN ONLY) */}
              {role === "ROLE_ADMIN" && (
                <div style={quickActionsContainer}>
                  <div 
                    style={billingCard}
                    onMouseEnter={() => setBillingMenuOpen(true)}
                    onMouseLeave={() => setBillingMenuOpen(false)}
                  >
                    <div 
                      style={billingButton}
                      onClick={() => setBillingMenuOpen(!billingMenuOpen)}
                    >
                      <div style={billingIcon}>🧾</div>
                      <div style={billingContent}>
                        <div style={billingTitle}>Billing</div>
                        <div style={billingSubtitle}>Customer • Quotation • Invoice</div>
                      </div>
                      <div style={billingArrow}>{billingMenuOpen ? "▲" : "▼"}</div>
                    </div>
                    
                    {billingMenuOpen && (
                      <div 
                        style={billingDropdownWrapper}
                        onMouseEnter={() => setBillingMenuOpen(true)}
                        onMouseLeave={() => setBillingMenuOpen(false)}
                      >
                        <div style={billingDropdown}>
                          <div 
                            style={billingMenuItem}
                            onClick={() => {
                              navigate("/customers");
                              setBillingMenuOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <span style={menuIcon}>👥</span>
                            <span>Customers</span>
                          </div>
                          <div 
                            style={billingMenuItem}
                            onClick={() => {
                              navigate("/quotations");
                              setBillingMenuOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <span style={menuIcon}>📄</span>
                            <span>Quotations</span>
                          </div>
                          <div 
                            style={{...billingMenuItem, borderBottom: "none"}}
                            onClick={() => {
                              navigate("/invoices");
                              setBillingMenuOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <span style={menuIcon}>🧾</span>
                            <span>Invoices</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KPI Cards */}
              {role === "ROLE_ADMIN" ? (
                <div className="kpi-grid" style={kpiGrid}>
                  <KPICard
                    icon="📦"
                    label="Total Stock"
                    value={stats.totalStock}
                    color="#6366f1"
                    loading={loading}
                  />
                  <KPICard
                    icon="🔄"
                    label="Transfers"
                    value={stats.totalTransfers}
                    color="#3b82f6"
                    loading={loading}
                  />
                  <KPICard
                    icon="👥"
                    label="Staff Members"
                    value={stats.totalStaff}
                    color="#22c55e"
                    loading={loading}
                  />
                  <KPICard
                    icon="📜"
                    label="Activity Logs"
                    value={stats.totalLogs}
                    color="#f59e0b"
                    loading={loading}
                  />
                </div>
              ) : (
                <div style={staffKpiContainer}>
                  <KPICard
                    icon="📦"
                    label="Total Stock"
                    value={stats.totalStock}
                    color="#6366f1"
                    loading={loading}
                    isSmall={true}
                  />
                </div>
              )}

          {/* ADMIN ONLY - Recent Activity */}
          {role === "ROLE_ADMIN" && (
            <div style={auditCard}>
              <div style={auditHeader}>
                <h3 style={auditTitle}>🧾 Recent Stock Activity</h3>
                <span style={auditSub}>Last 3 updates</span>
              </div>

              {auditLogs.length === 0 ? (
                <div style={emptyState}>
                  <div style={emptyIcon}>📋</div>
                  <p style={emptyText}>No recent activity</p>
                </div>
              ) : (
                <div style={auditList}>
                  {auditLogs.map((log, i) => (
                    <div key={i} style={auditItem}>
                      <div style={avatar}>
                        {log.username?.charAt(0).toUpperCase()}
                      </div>

                      <div style={auditContent}>
                        <div style={auditTop}>
                          <strong style={username}>{log.username}</strong>
                          <span style={badge(log.action)}>
                            {log.action}
                          </span>
                        </div>

                        <div style={auditMid}>
                          <span>
                            <b>{log.quantity}</b> × {log.glassType}
                          </span>
                          <span style={standInfo}>
                            {" "}• Stand #{log.standNo}
                          </span>
                        </div>

                        <div style={auditBottom}>
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

/* KPI Card Component */
function KPICard({ icon, label, value, color, loading, isSmall = false }) {
  const role = localStorage.getItem("role");
  const isStaff = role !== "ROLE_ADMIN";
  
  return (
    <div style={isStaff ? { ...kpiCard, ...staffKpiCard } : kpiCard}>
      <div style={{ 
        ...kpiIcon, 
        background: `${color}15`, 
        color, 
        ...(isStaff ? staffKpiIcon : {}) 
      }}>
        {icon}
      </div>
      <div style={kpiContent}>
        <div style={{ ...kpiValue, ...(isStaff ? staffKpiValue : {}) }}>
          {loading ? (
            <span style={{ ...skeleton, width: "60px", height: "24px", display: "inline-block" }} />
          ) : (
            value
          )}
        </div>
        <div style={{ ...kpiLabel, ...(isStaff ? staffKpiLabel : {}) }}>{label}</div>
      </div>
    </div>
  );
}

export default Dashboard;

/* ================= STYLES ================= */

const page = {
  minHeight: "calc(100vh - 70px)",
  padding: "32px 16px",
  maxWidth: "1400px",
  margin: "0 auto",
};

const container = {
  width: "100%",
};

const header = {
  textAlign: "center",
  marginBottom: "32px",
};

const title = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "8px",
  margin: 0,
};

const subtitle = {
  fontSize: "16px",
  color: "#64748b",
  margin: 0,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
  marginBottom: "32px",
};

const staffKpiContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "32px",
};

const kpiCard = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  transition: "all 0.2s ease",
};

const kpiIcon = {
  width: "56px",
  height: "56px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  flexShrink: 0,
};

const kpiContent = {
  flex: 1,
};

const kpiValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "4px",
  lineHeight: 1,
};

const kpiLabel = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500",
};

const skeleton = {
  background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-loading 1.5s ease-in-out infinite",
  borderRadius: "4px",
  display: "inline-block",
};

/* Staff Dashboard - Small KPI Card Styles */
const staffKpiCard = {
  maxWidth: "280px",
  width: "100%",
  padding: "20px",
};

const staffKpiIcon = {
  width: "48px",
  height: "48px",
  fontSize: "24px",
};

const staffKpiValue = {
  fontSize: "24px",
};

const staffKpiLabel = {
  fontSize: "13px",
};

const auditCard = {
  marginTop: "32px",
  padding: "24px",
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
};

const auditHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
};

const auditTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
};

const auditSub = {
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "500",
};

const auditList = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const auditItem = {
  display: "flex",
  gap: "16px",
  padding: "16px",
  borderRadius: "12px",
  background: "#f8fafc",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.2s ease",
};

const avatar = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  color: "white",
  fontSize: "16px",
  flexShrink: 0,
};

const auditContent = {
  flex: 1,
  fontSize: "14px",
};

const auditTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
};

const username = {
  color: "#0f172a",
  fontWeight: "600",
};

const auditMid = {
  marginTop: "4px",
  color: "#475569",
  fontSize: "14px",
};

const standInfo = {
  color: "#64748b",
  marginLeft: "8px",
};

const auditSize = {
  fontSize: "13px",
  color: "#64748b",
  marginTop: "4px",
};

const auditBottom = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "8px",
};

const badge = (action) => ({
  padding: "4px 12px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "600",
  color: "white",
  background:
    action === "ADD"
      ? "linear-gradient(135deg, #22c55e, #16a34a)"
      : action === "TRANSFER"
      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
      : "linear-gradient(135deg, #ef4444, #dc2626)",
});

const emptyState = {
  textAlign: "center",
  padding: "40px 20px",
};

const emptyIcon = {
  fontSize: "48px",
  marginBottom: "12px",
  opacity: 0.4,
};

const emptyText = {
  color: "#64748b",
  fontSize: "14px",
  margin: 0,
};

/* Billing Menu Styles */
const quickActionsContainer = {
  marginBottom: "32px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const billingCard = {
  position: "relative",
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  width: "100%",
  maxWidth: "400px",
  overflow: "visible",
};

const billingButton = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "24px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderRadius: "16px",
};

const billingIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  flexShrink: 0,
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
};

const billingContent = {
  flex: 1,
};

const billingTitle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "4px",
};

const billingSubtitle = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500",
};

const billingArrow = {
  fontSize: "16px",
  color: "#64748b",
  transition: "transform 0.2s ease",
};

const billingDropdownWrapper = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  paddingTop: "8px",
  zIndex: 1000,
};

const billingDropdown = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const billingMenuItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 24px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
  fontSize: "15px",
  fontWeight: "500",
  color: "#475569",
};

const menuIcon = {
  fontSize: "20px",
};
