

import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import dashboardBg from "../assets/dashboard-bg.jpg";
import api from "../api/api";
import ConfirmModal from "../components/ConfirmModal";

function StockManager() {
  const [glassTypeStock, setGlassTypeStock] = useState("");
  const [standNo, setStandNo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockMessage, setStockMessage] = useState("");

  const [glassMode, setGlassMode] = useState("SELECT");
  const [manualThickness, setManualThickness] = useState("");

  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [unit, setUnit] = useState("MM");

  // 🔴 CONFIRM MODAL
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  
  // 🔁 UNDO STATE
  const [showUndo, setShowUndo] = useState(false);

  /* ===============================
     OPEN CONFIRM MODAL (ADD / REMOVE)
     =============================== */
  const updateStock = (action) => {
    setStockMessage("");

    if (!standNo || !quantity || !height || !width) {
      setStockMessage("❌ Please fill all required fields");
      return;
    }

    if (glassMode === "SELECT" && !glassTypeStock) {
      setStockMessage("❌ Please select glass type");
      return;
    }

    if (glassMode === "MANUAL" && !manualThickness) {
      setStockMessage("❌ Please enter manual thickness");
      return;
    }

    const payload = {
  standNo: Number(standNo),
  quantity: Number(quantity),
  action,
  glassType:
    glassMode === "SELECT"
      ? glassTypeStock
      : `${manualThickness}MM`,
  thickness:
    glassMode === "SELECT"
      ? Number(glassTypeStock.replace("MM", ""))
      : Number(manualThickness),
  height, // ✅ STRING
  width,  // ✅ STRING
  unit
};


    setPendingPayload(payload);
    setShowConfirm(true);
  };

  /* ===============================
     CONFIRM & SAVE
     =============================== */
  const confirmSaveStock = async () => {
    try {
      await api.post("/stock/update", pendingPayload);

      setStockMessage("✅ Stock updated successfully");
      setShowUndo(true);

      // reset form
      setStandNo("");
      setQuantity("");
      setHeight("");
      setWidth("");
      setManualThickness("");
      setGlassTypeStock("");

    } catch (error) {
      setStockMessage(error.response?.data || "❌ Failed to update stock");
    } finally {
      setShowConfirm(false);
      setPendingPayload(null);
    }
  };

  /* ===============================
     UNDO LAST ACTION
     =============================== */
  const undoLastAction = async () => {
    try {
      const res = await api.post("/stock/undo");
      setStockMessage(res.data);
      setShowUndo(false);
    } catch {
      setStockMessage("❌ Failed to undo last action");
    }
  };

  return (
    <PageWrapper background={dashboardBg}>
      <div style={centerWrapper}>
        <div style={glassCard}>
          <h2 style={formTitle}>➕➖ Manage Stock</h2>
          <p style={formSubtitle}>Add or remove stock from inventory</p>

          <div style={formGroup}>
            <label style={label}>Glass Type Mode</label>
            <select 
              style={select}
              value={glassMode} 
              onChange={e => setGlassMode(e.target.value)}
            >
              <option value="SELECT">Select from list</option>
              <option value="MANUAL">Manual entry</option>
            </select>
          </div>

          {glassMode === "SELECT" ? (
            <div style={formGroup}>
              <label style={label}>Glass Type</label>
              <select
                style={select}
                value={glassTypeStock}
                onChange={e => setGlassTypeStock(e.target.value)}
              >
                <option value="">Select glass type</option>
                <option value="5MM">5 MM</option>
                <option value="8MM">8 MM</option>
                <option value="10MM">10 MM</option>
              </select>
            </div>
          ) : (
            <div style={formGroup}>
              <label style={label}>Manual Thickness (MM)</label>
              <input
                style={input}
                type="number"
                placeholder="Enter thickness in MM"
                value={manualThickness}
                onChange={e => setManualThickness(e.target.value)}
              />
            </div>
          )}

          <div style={formGroup}>
            <label style={label}>Dimension Unit</label>
            <select style={select} value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="MM">MM</option>
              <option value="INCH">INCH</option>
              <option value="FEET">FEET</option>
            </select>
          </div>

          <div style={formGroup}>
            <label style={label}>Height</label>
            <input
              style={input}
              type="text"
              placeholder={
                unit === "MM" 
                  ? "e.g. 26 1/4" 
                  : unit === "INCH" 
                  ? "e.g. 10, 20, 30"
                  : "e.g. 5, 10, 15"
              }
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Width</label>
            <input
              style={input}
              type="text"
              placeholder={
                unit === "MM" 
                  ? "e.g. 18 3/8" 
                  : unit === "INCH" 
                  ? "e.g. 10, 20, 30"
                  : "e.g. 5, 10, 15"
              }
              value={width}
              onChange={e => setWidth(e.target.value)}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Stand No</label>
            <input 
              style={input}
              type="number" 
              placeholder="Enter stand number"
              value={standNo} 
              onChange={e => setStandNo(e.target.value)} 
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Quantity</label>
            <input 
              style={input}
              type="number" 
              placeholder="Enter quantity"
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
            />
          </div>

          {/* ✅ SEPARATE ADD & REMOVE BUTTONS */}
          <div style={buttonGroup}>
            <button
              style={addButton}
              onClick={() => updateStock("ADD")}
            >
              ➕ Add Stock
            </button>

            <button
              style={removeButton}
              onClick={() => updateStock("REMOVE")}
            >
              ➖ Remove Stock
            </button>
          </div>

          {/* 🔁 UNDO BUTTON */}
          {showUndo && (
            <button
              style={undoButton}
              onClick={undoLastAction}
            >
              ↩ Undo Last Action
            </button>
          )}

          {stockMessage && (
            <div style={message(stockMessage.includes("✅"))}>
              {stockMessage}
            </div>
          )}
        </div>
      </div>

      {/* 🔴 CONFIRM MODAL */}
      <ConfirmModal
        show={showConfirm}
        payload={pendingPayload || {}}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmSaveStock}
      />
    </PageWrapper>
  );
}

/* ================= STYLES ================= */

const centerWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  minHeight: "70vh",
  padding: "32px 16px",
};

const glassCard = {
  width: "100%",
  maxWidth: "500px",
  padding: "32px",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const formTitle = {
  textAlign: "center",
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
  marginBottom: "4px",
};

const formSubtitle = {
  textAlign: "center",
  fontSize: "14px",
  color: "#64748b",
  margin: 0,
  marginBottom: "8px",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const label = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "4px",
};

const input = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: "14px",
  transition: "all 0.2s ease",
};

const select = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const buttonGroup = {
  display: "flex",
  gap: "12px",
  marginTop: "8px",
};

const addButton = {
  flex: 1,
  padding: "14px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
};

const removeButton = {
  flex: 1,
  padding: "14px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
};

const undoButton = {
  width: "100%",
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #f59e0b, #d97706)",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  marginTop: "8px",
  transition: "all 0.2s ease",
};

const message = (isSuccess) => ({
  textAlign: "center",
  fontWeight: "600",
  fontSize: "14px",
  padding: "12px 16px",
  borderRadius: "8px",
  marginTop: "8px",
  background: isSuccess 
    ? "rgba(34, 197, 94, 0.1)" 
    : "rgba(239, 68, 68, 0.1)",
  color: isSuccess ? "#16a34a" : "#dc2626",
  border: `1px solid ${isSuccess ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
});

export default StockManager;
