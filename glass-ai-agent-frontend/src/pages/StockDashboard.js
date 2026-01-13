

// import { useEffect, useState, useMemo } from "react";
// import { toast } from "react-toastify";
// import api from "../api/api";
// import PageWrapper from "../components/PageWrapper";
// import stockBg from "../assets/stock-bg.jpg";

// function StockDashboard() {
//   const [allStock, setAllStock] = useState([]);

//   const [filterGlassType, setFilterGlassType] = useState("");
//   const [filterHeight, setFilterHeight] = useState("");
//   const [filterWidth, setFilterWidth] = useState("");

//   /* ================= LOAD STOCK ================= */
//   const loadStock = async () => {
//     try {
//       const res = await api.get("/stock/all");
//       setAllStock(res.data);

//       res.data.forEach(item => {
//         if (item.quantity < item.minQuantity) {
//           toast.error(
//             `🚨 LOW STOCK: ${item.glass?.type} (Stand ${item.standNo})`,
//             { toastId: `${item.standNo}-${item.glass?.type}` }
//           );
//         }
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     loadStock();
//   }, []);

//   /* ================= LIVE FILTERING ================= */
//   const filteredStock = useMemo(() => {
//   const h = Number(filterHeight);
//   const w = Number(filterWidth);

//   return allStock.filter(s => {
//     const matchGlass =
//       !filterGlassType ||
//       s.glass?.type?.toLowerCase().includes(filterGlassType.toLowerCase());

//     const matchHeight =
//       !filterHeight ||
//       (Number(s.height) >= h && Number(s.height) <= h + 3);

//     const matchWidth =
//       !filterWidth ||
//       (Number(s.width) >= w && Number(s.width) <= w + 3);

//     return matchGlass && matchHeight && matchWidth;
//   });
// }, [allStock, filterGlassType, filterHeight, filterWidth]);

//   <button
//   style={downloadBtn}
//   onClick={() =>
//     window.open("http://localhost:8080/stock/download", "_blank")
//   }
// >
//   ⬇ Download Stock Report
// </button>


//   /* ================= UI ================= */
//   return (
//     <PageWrapper background={stockBg}>
//       <div style={tableCard}>
//         <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
//           📦 View Stock
//         </h2>

//         {/* 🔍 SEARCH BAR */}
//         <div style={filterBar}>
//           <input
//             type="text"
//             placeholder="Glass Type (5MM)"
//             value={filterGlassType}
//             onChange={e => setFilterGlassType(e.target.value)}
//           />

//           <input
//             type="number"
//             placeholder="Height (5 → 8)"
//             value={filterHeight}
//             onChange={e => setFilterHeight(e.target.value)}
//           />

//           <input
//             type="number"
//             placeholder="Width (5 → 8)"
//             value={filterWidth}
//             onChange={e => setFilterWidth(e.target.value)}
//           />

//           <button
//             onClick={() => {
//               setFilterGlassType("");
//               setFilterHeight("");
//               setFilterWidth("");
//             }}
//           >
//             Clear
//           </button>
//         </div>

//         {/* 📊 TABLE */}
//         <table style={tableStyle}>
//           <thead>
//             <tr>
//               <th>Stand</th>
//               <th>Glass</th>
//               <th>Thickness</th>
//               <th>Height</th>
//               <th>Width</th>
//               <th>Qty</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredStock.length === 0 ? (
//               <tr>
//                 <td colSpan="7">No stock found</td>
//               </tr>
//             ) : (
//               filteredStock.map((s, i) => {
//                 const isLow = s.quantity < s.minQuantity;

//                 return (
//                   <tr
//                     key={i}
//                     style={{
//                       backgroundColor: isLow
//                         ? "rgba(255, 0, 0, 0.25)"
//                         : "transparent",
//                       color: isLow ? "#ff4d4d" : "white",
//                       animation: isLow ? "blink 1s infinite" : "none",
//                       fontWeight: isLow ? "bold" : "normal"
//                     }}
//                   >
//                     <td>{s.standNo}</td>
//                     <td>{s.glass?.type}</td>
//                     <td>{s.glass?.thickness} mm</td>

//                     <td>
//   {s.height}{" "}
//   {s.glass?.unit === "FEET" && "ft"}
//   {s.glass?.unit === "INCH" && "in"}
//   {s.glass?.unit === "MM" && "mm"}
// </td>

// <td>
//   {s.width}{" "}
//   {s.glass?.unit === "FEET" && "ft"}
//   {s.glass?.unit === "INCH" && "in"}
//   {s.glass?.unit === "MM" && "mm"}
// </td>


//                     <td>{s.quantity}</td>

//                     <td>
//                       {isLow ? "🔴 LOW" : "✅ OK"}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </PageWrapper>
//   );
// }

// /* ================= STYLES ================= */

// const downloadBtn = {
//   padding: "10px 18px",
//   marginBottom: "15px",
//   borderRadius: "10px",
//   background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
//   color: "white",
//   fontWeight: "600",
//   border: "none",
//   cursor: "pointer",
// };


// const tableCard = {
//   width: "90%",
//   margin: "auto",
//   padding: "20px",
//   background: "rgba(0,0,0,0.6)",
//   borderRadius: "12px",
// };

// const filterBar = {
//   display: "flex",
//   gap: "8px",
//   marginBottom: "15px",
//   justifyContent: "center",
//   flexWrap: "wrap",
// };

// const tableStyle = {
//   width: "100%",
//   color: "white",
//   textAlign: "center",
//   borderCollapse: "collapse",
// };

// export default StockDashboard;


import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../api/api";
import PageWrapper from "../components/PageWrapper";
import stockBg from "../assets/stock-bg.jpg";
import ConfirmModal from "../components/ConfirmModal";

/* ================= UNIT CONVERSION FUNCTIONS ================= */

/**
 * Parse dimension string (handles fractions like "26 1/4" or "5.5" or "5")
 * Returns the numeric value in the given unit
 */
const parseDimension = (dimensionStr) => {
  if (!dimensionStr || dimensionStr.trim() === "") return null;
  
  const str = dimensionStr.trim();
  
  // Handle fraction format: "26 1/4" or "1/4"
  const fractionMatch = str.match(/(\d+)?\s*(\d+)\/(\d+)/);
  if (fractionMatch) {
    const wholePart = fractionMatch[1] ? parseFloat(fractionMatch[1]) : 0;
    const numerator = parseFloat(fractionMatch[2]);
    const denominator = parseFloat(fractionMatch[3]);
    return wholePart + (numerator / denominator);
  }
  
  // Handle decimal format: "5.5" or "127"
  const decimal = parseFloat(str);
  if (!isNaN(decimal)) {
    return decimal;
  }
  
  return null;
};

/**
 * Convert value from source unit to MM
 */
const convertToMM = (value, fromUnit) => {
  if (value === null || value === undefined || isNaN(value)) return null;
  
  switch (fromUnit?.toUpperCase()) {
    case "MM":
      return value;
    case "INCH":
      return value * 25.4; // 1 inch = 25.4 mm
    case "FEET":
      return value * 304.8; // 1 foot = 304.8 mm (12 inches)
    default:
      return value; // Default to MM if unit not recognized
  }
};

/**
 * Convert value from MM to target unit
 */
const convertFromMM = (valueInMM, toUnit) => {
  if (valueInMM === null || valueInMM === undefined || isNaN(valueInMM)) return null;
  
  switch (toUnit?.toUpperCase()) {
    case "MM":
      return valueInMM;
    case "INCH":
      return valueInMM / 25.4;
    case "FEET":
      return valueInMM / 304.8;
    default:
      return valueInMM;
  }
};

function StockDashboard() {
  const [allStock, setAllStock] = useState([]);

  const [filterGlassType, setFilterGlassType] = useState("");
  const [filterHeight, setFilterHeight] = useState("");
  const [filterWidth, setFilterWidth] = useState("");
  const [searchUnit, setSearchUnit] = useState("MM"); // Unit for search (MM, INCH, FEET)

  // Add/Remove Modal State
  const [showAddRemoveModal, setShowAddRemoveModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStock, setTransferStock] = useState(null);
  const [toStand, setToStand] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  /* ================= LOAD STOCK ================= */
  const loadStock = async () => {
    try {
      const res = await api.get("/stock/all");
      setAllStock(res.data);

      res.data.forEach(item => {
        if (item.quantity < item.minQuantity) {
          toast.error(
            `🚨 LOW STOCK: ${item.glass?.type} (Stand ${item.standNo})`,
            { toastId: `${item.standNo}-${item.glass?.type}` }
          );
        }
      });
    } catch (err) {
      console.error(err);
      // If it's a 401, the interceptor will handle redirect
      // For other errors, show a message
      if (err.response?.status !== 401) {
        toast.error("Failed to load stock. Please try again.");
      }
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  /* ===============================
     OPEN ADD/REMOVE MODAL
     =============================== */
  const openAddRemoveModal = (stock) => {
    setSelectedStock(stock);
    setQuantity("");
    setStockMessage("");
    setShowAddRemoveModal(true);
  };

  const closeAddRemoveModal = () => {
    setShowAddRemoveModal(false);
    setSelectedStock(null);
    setQuantity("");
    setStockMessage("");
  };

  /* ===============================
     UPDATE STOCK (ADD / REMOVE)
     =============================== */
  const updateStock = (action) => {
    setStockMessage("");

    if (!quantity || Number(quantity) <= 0) {
      setStockMessage("❌ Please enter a valid quantity");
      return;
    }

    if (!selectedStock) {
      setStockMessage("❌ No stock item selected");
      return;
    }

    const payload = {
      standNo: selectedStock.standNo,
      quantity: Number(quantity),
      action,
      glassType: selectedStock.glass?.type,
      thickness: selectedStock.glass?.thickness,
      height: selectedStock.height,
      width: selectedStock.width,
      unit: selectedStock.glass?.unit || "MM"
    };

    setPendingPayload(payload);
    setShowConfirm(true);
    // Close the add/remove modal when confirm modal opens
    setShowAddRemoveModal(false);
  };

  /* ===============================
     CONFIRM & SAVE
     =============================== */
  const confirmSaveStock = async () => {
    try {
      await api.post("/stock/update", pendingPayload);

      // Close confirm modal first
      setShowConfirm(false);
      setPendingPayload(null);

      // Show success message in a toast or alert
      toast.success("✅ Stock updated successfully");
      setShowUndo(true);

      // Reload stock list
      await loadStock();

      // Reset and close add/remove modal
      closeAddRemoveModal();
      setShowUndo(false);

    } catch (error) {
      setShowConfirm(false);
      setPendingPayload(null);
      // Reopen add/remove modal to show error
      setShowAddRemoveModal(true);
      setStockMessage(error.response?.data || "❌ Failed to update stock");
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
      // Reload stock list
      await loadStock();
    } catch {
      setStockMessage("❌ Failed to undo last action");
    }
  };

  /* ===============================
     TRANSFER MODAL FUNCTIONS
     =============================== */
  const openTransferModal = (stock) => {
    setTransferStock(stock);
    setToStand("");
    setTransferQuantity("");
    setTransferMessage("");
    setShowTransferModal(true);
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setTransferStock(null);
    setToStand("");
    setTransferQuantity("");
    setTransferMessage("");
  };

  const handleTransfer = () => {
    setTransferMessage("");

    if (!toStand || Number(toStand) <= 0) {
      setTransferMessage("❌ Please enter a valid destination stand number");
      return;
    }

    if (!transferQuantity || Number(transferQuantity) <= 0) {
      setTransferMessage("❌ Please enter a valid quantity");
      return;
    }

    if (!transferStock) {
      setTransferMessage("❌ No stock item selected");
      return;
    }

    if (Number(toStand) === transferStock.standNo) {
      setTransferMessage("❌ From stand and to stand cannot be the same");
      return;
    }

    // Format glass type
    let formattedGlassType = transferStock.glass?.type || "";
    if (formattedGlassType && /^\d+$/.test(formattedGlassType.trim())) {
      formattedGlassType = formattedGlassType.trim() + "MM";
    }

    setShowTransferConfirm(true);
    // Close transfer modal when confirm opens
    setShowTransferModal(false);
  };

  const confirmTransfer = async () => {
    try {
      let formattedGlassType = transferStock.glass?.type || "";
      if (formattedGlassType && /^\d+$/.test(formattedGlassType.trim())) {
        formattedGlassType = formattedGlassType.trim() + "MM";
      }

      const res = await api.post("/stock/transfer", {
        glassType: formattedGlassType,
        unit: transferStock.glass?.unit || "MM",
        height: transferStock.height,
        width: transferStock.width,
        fromStand: Number(transferStock.standNo),
        toStand: Number(toStand),
        quantity: Number(transferQuantity)
      });

      setTransferMessage("✅ Transfer completed successfully");
      setShowTransferConfirm(false);

      // Reload stock list
      await loadStock();

      // Reset and close
      setTimeout(() => {
        closeTransferModal();
        setTransferMessage("");
      }, 2000);

    } catch (error) {
      setTransferMessage(error.response?.data || "❌ Transfer failed");
      setShowTransferConfirm(false);
      setShowTransferModal(true); // Reopen modal to show error
    }
  };

  /* ================= FILTER ================= */
  const filteredStock = useMemo(() => {
    // Parse search values
    const searchHeightValue = parseDimension(filterHeight);
    const searchWidthValue = parseDimension(filterWidth);
    
    // Convert search values to MM for comparison
    const searchHeightMM = searchHeightValue !== null 
      ? convertToMM(searchHeightValue, searchUnit) 
      : null;
    const searchWidthMM = searchWidthValue !== null 
      ? convertToMM(searchWidthValue, searchUnit) 
      : null;

    // Filter stock
    const filtered = allStock.filter(s => {
      // Match glass type
      const matchGlass =
        !filterGlassType ||
        s.glass?.type?.toLowerCase().includes(filterGlassType.toLowerCase());

      // Match height with unit conversion - show all stock >= search value
      let matchHeight = true;
      if (searchHeightMM !== null) {
        const stockHeightValue = parseDimension(s.height);
        if (stockHeightValue !== null) {
          // Convert stock height to MM based on its stored unit
          const stockHeightMM = convertToMM(stockHeightValue, s.glass?.unit);
          if (stockHeightMM !== null) {
            // Show all stock with height >= search value
            matchHeight = stockHeightMM >= searchHeightMM;
          } else {
            matchHeight = false;
          }
        } else {
          matchHeight = false;
        }
      }

      // Match width with unit conversion - show all stock >= search value
      let matchWidth = true;
      if (searchWidthMM !== null) {
        const stockWidthValue = parseDimension(s.width);
        if (stockWidthValue !== null) {
          // Convert stock width to MM based on its stored unit
          const stockWidthMM = convertToMM(stockWidthValue, s.glass?.unit);
          if (stockWidthMM !== null) {
            // Show all stock with width >= search value
            matchWidth = stockWidthMM >= searchWidthMM;
          } else {
            matchWidth = false;
          }
        } else {
          matchWidth = false;
        }
      }

      return matchGlass && matchHeight && matchWidth;
    });

    // Sort results by height first, then width (both ascending)
    return filtered.sort((a, b) => {
      // Parse and convert heights to MM for comparison
      const aHeightValue = parseDimension(a.height);
      const bHeightValue = parseDimension(b.height);
      const aHeightMM = aHeightValue !== null ? convertToMM(aHeightValue, a.glass?.unit) : 0;
      const bHeightMM = bHeightValue !== null ? convertToMM(bHeightValue, b.glass?.unit) : 0;

      // If heights are different, sort by height
      if (aHeightMM !== bHeightMM) {
        return aHeightMM - bHeightMM;
      }

      // If heights are same, sort by width
      const aWidthValue = parseDimension(a.width);
      const bWidthValue = parseDimension(b.width);
      const aWidthMM = aWidthValue !== null ? convertToMM(aWidthValue, a.glass?.unit) : 0;
      const bWidthMM = bWidthValue !== null ? convertToMM(bWidthValue, b.glass?.unit) : 0;

      return aWidthMM - bWidthMM;
    });
  }, [allStock, filterGlassType, filterHeight, filterWidth, searchUnit]);

  return (
    <PageWrapper background={stockBg}>
      <div style={card}>
        <h2 style={title}>📦 View Stock</h2>

        {/* 🔍 FILTERS */}
        <div className="filter-grid" style={filters}>
          <input
            style={input}
            placeholder="Glass Type (5MM)"
            value={filterGlassType}
            onChange={e => setFilterGlassType(e.target.value)}
          />

          <input
            style={input}
            type="text"
            placeholder="Height (e.g. 5, 5.5, 5 1/4)"
            value={filterHeight}
            onChange={e => setFilterHeight(e.target.value)}
          />

          <input
            style={input}
            type="text"
            placeholder="Width (e.g. 7, 7.5, 7 3/8)"
            value={filterWidth}
            onChange={e => setFilterWidth(e.target.value)}
          />

          <select
            style={input}
            value={searchUnit}
            onChange={e => setSearchUnit(e.target.value)}
            title="Select unit for height and width search"
          >
            <option value="MM">MM</option>
            <option value="INCH">INCH</option>
            <option value="FEET">FEET</option>
          </select>

          <button
            style={clearBtn}
            onClick={() => {
              setFilterGlassType("");
              setFilterHeight("");
              setFilterWidth("");
              setSearchUnit("MM");
            }}
          >
            Clear
          </button>
        </div>

        {/* 📊 TABLE (SCROLLABLE) */}
        <div className="table-wrapper" style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th>Stand</th>
                <th>Glass</th>
                <th>Thickness</th>
                <th>Height</th>
                <th>Width</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div style={emptyState}>
                      <div style={emptyIcon}>📦</div>
                      <p style={emptyText}>No stock found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStock.map((s, i) => {
                  const isLow = s.quantity < s.minQuantity;

                  return (
                    <tr
                      key={i}
                      className={isLow ? "low-stock" : ""}
                      style={{
                        fontWeight: isLow ? "600" : "400",
                      }}
                    >
                      <td>{s.standNo}</td>
                      <td>{s.glass?.type}</td>
                      <td>{s.glass?.thickness} mm</td>

                      <td>
                        {s.height}{" "}
                        {s.glass?.unit === "FEET" && "ft"}
                        {s.glass?.unit === "INCH" && "in"}
                        {s.glass?.unit === "MM" && "mm"}
                      </td>

                      <td>
                        {s.width}{" "}
                        {s.glass?.unit === "FEET" && "ft"}
                        {s.glass?.unit === "INCH" && "in"}
                        {s.glass?.unit === "MM" && "mm"}
                      </td>

                      <td>
                        <span style={quantityBadge(isLow)}>{s.quantity}</span>
                      </td>
                      <td>
                        <span style={statusBadge(isLow)}>
                          {isLow ? "🔴 LOW" : "✅ OK"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-container" style={actionButtonsContainer}>
                          <button
                            className="action-btn add-remove-btn"
                            style={actionButton}
                            onClick={() => openAddRemoveModal(s)}
                            title="Add or Remove Stock"
                          >
                            <span className="btn-icon">➕➖</span>
                            <span className="btn-text">Add/Remove</span>
                          </button>
                          <button
                            className="action-btn transfer-btn"
                            style={transferButton}
                            onClick={() => openTransferModal(s)}
                            title="Transfer Stock"
                          >
                            <span className="btn-icon">🔄</span>
                            <span className="btn-text">Transfer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Remove Modal */}
      {showAddRemoveModal && selectedStock && (
        <div style={modalOverlay} onClick={closeAddRemoveModal}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>➕➖ Add/Remove Stock</h3>
              <button style={closeModalBtn} onClick={closeAddRemoveModal}>✕</button>
            </div>

            <div style={modalContent}>
              {/* Stock Info Display */}
              <div style={stockInfoCard}>
                <h4 style={infoTitle}>Stock Details</h4>
                <div style={infoRow}>
                  <span style={infoLabel}>Glass Type:</span>
                  <span style={infoValue}>{selectedStock.glass?.type}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Thickness:</span>
                  <span style={infoValue}>{selectedStock.glass?.thickness} mm</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Size:</span>
                  <span style={infoValue}>
                    {selectedStock.height} × {selectedStock.width} {selectedStock.glass?.unit || "MM"}
                  </span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Stand No:</span>
                  <span style={infoValue}>#{selectedStock.standNo}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Current Quantity:</span>
                  <span style={infoValue}>{selectedStock.quantity} units</span>
                </div>
              </div>

              {/* Quantity Input */}
              <div style={formGroup}>
                <label style={label}>Quantity</label>
                <input
                  style={modalInput}
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>

              {/* Action Buttons */}
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

              {/* Undo Button */}
              {showUndo && (
                <button
                  style={undoButton}
                  onClick={undoLastAction}
                >
                  ↩ Undo Last Action
                </button>
              )}

              {/* Message */}
              {stockMessage && (
                <div style={message(stockMessage.includes("✅"))}>
                  {stockMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferStock && (
        <div style={modalOverlay} onClick={closeTransferModal}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>🔄 Transfer Stock</h3>
              <button style={closeModalBtn} onClick={closeTransferModal}>✕</button>
            </div>

            <div style={modalContent}>
              {/* Stock Info Display */}
              <div style={stockInfoCard}>
                <h4 style={infoTitle}>Stock Details</h4>
                <div style={infoRow}>
                  <span style={infoLabel}>Glass Type:</span>
                  <span style={infoValue}>{transferStock.glass?.type}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Thickness:</span>
                  <span style={infoValue}>{transferStock.glass?.thickness} mm</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Size:</span>
                  <span style={infoValue}>
                    {transferStock.height} × {transferStock.width} {transferStock.glass?.unit || "MM"}
                  </span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>From Stand:</span>
                  <span style={infoValue}>#{transferStock.standNo}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Current Quantity:</span>
                  <span style={infoValue}>{transferStock.quantity} units</span>
                </div>
              </div>

              {/* Transfer Fields */}
              <div style={formGroup}>
                <label style={label}>To Stand</label>
                <input
                  style={modalInput}
                  type="number"
                  placeholder="Enter destination stand number"
                  value={toStand}
                  onChange={(e) => setToStand(e.target.value)}
                  min="1"
                />
              </div>

              <div style={formGroup}>
                <label style={label}>Quantity</label>
                <input
                  style={modalInput}
                  type="number"
                  placeholder="Enter quantity to transfer"
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  min="1"
                  max={transferStock.quantity}
                />
              </div>

              {/* Transfer Button */}
              <button
                style={transferSubmitButton}
                onClick={handleTransfer}
              >
                🔄 Transfer Stock
              </button>

              {/* Message */}
              {transferMessage && (
                <div style={message(transferMessage.includes("✅"))}>
                  {transferMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Confirm Modal */}
      {showTransferConfirm && transferStock && (
        <div style={modalOverlay} onClick={() => setShowTransferConfirm(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>⚠️ Confirm Stock Transfer</h3>
              <button style={closeModalBtn} onClick={() => setShowTransferConfirm(false)}>✕</button>
            </div>

            <div style={modalContent}>
              <div style={stockInfoCard}>
                <h4 style={infoTitle}>Transfer Summary</h4>
                <div style={infoRow}>
                  <span style={infoLabel}>Glass Type:</span>
                  <span style={infoValue}>{transferStock.glass?.type}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Size:</span>
                  <span style={infoValue}>
                    {transferStock.height} × {transferStock.width} {transferStock.glass?.unit || "MM"}
                  </span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>From Stand:</span>
                  <span style={infoValue}>#{transferStock.standNo}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>To Stand:</span>
                  <span style={infoValue}>#{toStand}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Quantity:</span>
                  <span style={infoValue}>{transferQuantity} units</span>
                </div>
              </div>

              <div style={buttonGroup}>
                <button
                  style={cancelButton}
                  onClick={() => {
                    setShowTransferConfirm(false);
                    setShowTransferModal(true);
                  }}
                >
                  Cancel
                </button>
                <button
                  style={confirmTransferButton}
                  onClick={confirmTransfer}
                >
                  ✅ Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal for Add/Remove */}
      <ConfirmModal
        show={showConfirm}
        payload={pendingPayload || {}}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmSaveStock}
      />
    </PageWrapper>
  );
}

export default StockDashboard;

/* ================= STYLES ================= */

const card = {
  width: "100%",
  maxWidth: "1200px",
  margin: "auto",
  padding: "clamp(16px, 4vw, 24px)",
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
};

const title = {
  textAlign: "center",
  marginBottom: "clamp(16px, 4vw, 24px)",
  fontSize: "clamp(20px, 5vw, 24px)",
  fontWeight: "700",
  color: "#0f172a",
};

const filters = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "clamp(8px, 2vw, 12px)",
  marginBottom: "clamp(16px, 4vw, 24px)",
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

const clearBtn = {
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #64748b, #475569)",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s ease",
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  maxHeight: "600px",
  overflowY: "auto",
};

const table = {
  width: "100%",
  minWidth: "900px",
  borderCollapse: "collapse",
  textAlign: "center",
};

const quantityBadge = (isLow) => ({
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "13px",
  background: isLow ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
  color: isLow ? "#dc2626" : "#16a34a",
});

const statusBadge = (isLow) => ({
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "12px",
  background: isLow ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
  color: isLow ? "#dc2626" : "#16a34a",
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

/* ================= MODAL STYLES ================= */

const actionButtonsContainer = {
  display: "flex",
  gap: "8px",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
};

const actionButton = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "white",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minHeight: "40px",
  minWidth: "120px",
  position: "relative",
  overflow: "hidden",
};

const transferButton = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minHeight: "40px",
  minWidth: "120px",
  position: "relative",
  overflow: "hidden",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  backdropFilter: "blur(4px)",
};

const modalCard = {
  background: "rgba(255, 255, 255, 0.98)",
  borderRadius: "16px",
  padding: "28px",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  animation: "slideIn 0.3s ease-out",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
};

const modalTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
};

const closeModalBtn = {
  background: "transparent",
  border: "none",
  fontSize: "24px",
  color: "#64748b",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const modalContent = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const stockInfoCard = {
  background: "#f8fafc",
  borderRadius: "12px",
  padding: "20px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
  marginBottom: "12px",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
};

const infoLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#475569",
};

const infoValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#0f172a",
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

const modalInput = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: "14px",
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

const transferSubmitButton = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
  marginTop: "8px",
};

const cancelButton = {
  flex: 1,
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#64748b",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const confirmTransferButton = {
  flex: 1,
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
};

