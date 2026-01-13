

// import { useState } from "react";
// import PageWrapper from "../components/PageWrapper";
// import api from "../api/api";

// function StockTransfer() {
//   const [form, setForm] = useState({
//     glassType: "",
//     unit: "MM",
//     height: "",
//     width: "",
//     fromStand: "",
//     toStand: "",
//     quantity: ""
//   });

//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleTransfer = async () => {
    
//     try {
//       const res = await api.post("/stock/transfer", {
//         ...form,
//         fromStand: Number(form.fromStand),
//         toStand: Number(form.toStand),
//         quantity: Number(form.quantity)
//       });
//       setMessage(res.data);
//     } catch {
//       setMessage("❌ Transfer failed");
//     }
//   };

//   return (
//     <PageWrapper>
//       <div style={page}>
//         <div style={card}>
//           <h2 style={title}>🔁 Transfer Stock</h2>
//           <p style={subtitle}>Move glass between stands safely</p>

//           {/* ROW 1 */}
//           <div style={grid}>
//             <Field label="Glass Type">
//               <input
//                 name="glassType"
//                 placeholder="5MM"
//                 value={form.glassType}
//                 onChange={handleChange}
//               />
//             </Field>

//             <Field label="Unit">
//               <select name="unit" value={form.unit} onChange={handleChange}>
//                 <option value="MM">MM</option>
//                 <option value="INCH">INCH</option>
//                 <option value="FEET">FEET</option>
//               </select>
//             </Field>

//             <Field label="Height">
//               <input
//                 name="height"
//                 placeholder="26 1/4"
//                 value={form.height}
//                 onChange={handleChange}
//               />
//             </Field>

//             <Field label="Width">
//               <input
//                 name="width"
//                 placeholder="18 3/8"
//                 value={form.width}
//                 onChange={handleChange}
//               />
//             </Field>
//           </div>

//           {/* ROW 2 */}
//           <div style={grid}>
//             <Field label="From Stand">
//               <input
//                 type="number"
//                 name="fromStand"
//                 value={form.fromStand}
//                 onChange={handleChange}
//               />
//             </Field>

//             <Field label="To Stand">
//               <input
//                 type="number"
//                 name="toStand"
//                 value={form.toStand}
//                 onChange={handleChange}
//               />
//             </Field>

//             <Field label="Quantity">
//               <input
//                 type="number"
//                 name="quantity"
//                 value={form.quantity}
//                 onChange={handleChange}
//               />
//             </Field>
//           </div>

//           <button style={button} onClick={handleTransfer}>
//             🔄 Transfer Stock
//           </button>

//           {message && <p style={messageStyle}>{message}</p>}
//         </div>
//       </div>
//     </PageWrapper>
//   );
// }

// const Field = ({ label, children }) => (
//   <div style={field}>
//     <label style={labelStyle}>{label}</label>
//     {children}
//   </div>
// );

// const page = {
//   minHeight: "calc(100vh - 80px)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
// };

// const card = {
//   width: "900px",
//   padding: "30px",
//   borderRadius: "18px",
//   background: "rgba(0,0,0,0.6)",
//   backdropFilter: "blur(12px)",
//   boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
//   color: "white",
// };

// const title = {
//   textAlign: "center",
//   fontSize: "24px",
//   fontWeight: "700",
// };

// const subtitle = {
//   textAlign: "center",
//   fontSize: "13px",
//   opacity: 0.8,
//   marginBottom: "25px",
// };

// const grid = {
//   display: "grid",
//   gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//   gap: "15px",
//   marginBottom: "15px",
// };

// const field = {
//   display: "flex",
//   flexDirection: "column",
// };

// const labelStyle = {
//   fontSize: "12px",
//   marginBottom: "6px",
//   opacity: 0.85,
// };

// const button = {
//   width: "100%",
//   marginTop: "15px",
//   padding: "14px",
//   borderRadius: "12px",
//   border: "none",
//   fontSize: "15px",
//   fontWeight: "600",
//   cursor: "pointer",
//   background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
//   color: "white",
// };

// const messageStyle = {
//   marginTop: "12px",
//   textAlign: "center",
//   fontWeight: "600",
// };


// export default StockTransfer;

import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import api from "../api/api";

function StockTransfer() {
  const [form, setForm] = useState({
    glassType: "",
    unit: "MM",
    height: "",
    width: "",
    fromStand: "",
    toStand: "",
    quantity: ""
  });

  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For glass type, allow both "5" and "5MM" formats
    // We'll auto-append "MM" on blur or submit if it's just a number
    setForm({ ...form, [name]: value });
  };

  // Format glass type when field loses focus
  const handleGlassTypeBlur = () => {
    if (form.glassType) {
      // If it's just a number (no letters), append "MM"
      if (/^\d+$/.test(form.glassType.trim())) {
        setForm({ ...form, glassType: form.glassType.trim() + "MM" });
      }
      // If it already has letters (like "5MM", "8MM"), keep it as is
    }
  };

  // 🔹 OPEN CONFIRM MODAL
  const handleTransfer = () => {
    setShowConfirm(true);
  };

  // 🔹 ACTUAL API CALL AFTER CONFIRM
  const confirmTransfer = async () => {
    try {
      // Format glass type: if it's just a number, append "MM"
      let formattedGlassType = form.glassType?.trim() || "";
      if (formattedGlassType && /^\d+$/.test(formattedGlassType)) {
        formattedGlassType = formattedGlassType + "MM";
      }
      
      const res = await api.post("/stock/transfer", {
        ...form,
        glassType: formattedGlassType,
        fromStand: Number(form.fromStand),
        toStand: Number(form.toStand),
        quantity: Number(form.quantity)
      });

      setMessage(res.data);
      setShowConfirm(false);
    } catch {
      setMessage("❌ Transfer failed");
      setShowConfirm(false);
    }
  };

  return (
    <PageWrapper>
      <div style={page}>
        <div style={card}>
          <h2 style={title}>🔁 Transfer Stock</h2>
          <p style={subtitle}>Move glass between stands safely</p>

          {/* ROW 1 */}
          <div style={grid}>
            <Field label="Glass Type">
              <input
                name="glassType"
                placeholder="5 (or 5MM)"
                value={form.glassType}
                onChange={handleChange}
                onBlur={handleGlassTypeBlur}
              />
            </Field>

            <Field label="Unit">
              <select name="unit" value={form.unit} onChange={handleChange}>
                <option value="MM">MM</option>
                <option value="INCH">INCH</option>
                <option value="FEET">FEET</option>
              </select>
            </Field>

            <Field label="Height">
              <input
                name="height"
                value={form.height}
                onChange={handleChange}
              />
            </Field>

            <Field label="Width">
              <input
                name="width"
                value={form.width}
                onChange={handleChange}
              />
            </Field>
          </div>

          {/* ROW 2 */}
          <div style={grid}>
            <Field label="From Stand">
              <input
                type="number"
                name="fromStand"
                value={form.fromStand}
                onChange={handleChange}
              />
            </Field>

            <Field label="To Stand">
              <input
                type="number"
                name="toStand"
                value={form.toStand}
                onChange={handleChange}
              />
            </Field>

            <Field label="Quantity">
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </Field>
          </div>

          <button style={button} onClick={handleTransfer}>
            🔄 Transfer Stock
          </button>

          {message && <p style={messageStyle}>{message}</p>}
        </div>
      </div>

      {/* ✅ CONFIRMATION MODAL */}
      {showConfirm && (
        <div style={overlay}>
          <div style={modal}>
            <h3>⚠️ Confirm Stock Transfer</h3>

            <div style={summary}>
              <p><b>Glass:</b> {form.glassType && /^\d+$/.test(form.glassType.trim()) ? form.glassType.trim() + "MM" : form.glassType}</p>
              <p><b>Unit:</b> {form.unit}</p>
              <p><b>Height:</b> {form.height}</p>
              <p><b>Width:</b> {form.width}</p>
              <hr />
              <p><b>From Stand:</b> {form.fromStand}</p>
              <p><b>To Stand:</b> {form.toStand}</p>
              <p><b>Quantity:</b> {form.quantity}</p>
            </div>

            <div style={actions}>
              <button style={cancelBtn} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button style={confirmBtn} onClick={confirmTransfer}>
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

const Field = ({ label, children }) => (
  <div style={field}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

/* ===== STYLES ===== */

const page = {
  minHeight: "calc(100vh - 80px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// const card = {
//   width: "900px",
//   padding: "30px",
//   borderRadius: "18px",
//   background: "rgba(0,0,0,0.6)",
//   backdropFilter: "blur(12px)",
//   boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
//   color: "white",
// };

const card = {
  width: "100%",
  maxWidth: "900px",
  padding: "20px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
  color: "white",
};


const title = {
  textAlign: "center",
  fontSize: "24px",
  fontWeight: "700",
};

const subtitle = {
  textAlign: "center",
  fontSize: "13px",
  opacity: 0.8,
  marginBottom: "25px",
};

// const grid = {
//   display: "grid",
//   gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//   gap: "15px",
//   marginBottom: "15px",
// };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
  marginBottom: "15px",
};


const field = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontSize: "12px",
  marginBottom: "6px",
  opacity: 0.85,
};

const button = {
  width: "100%",
  marginTop: "15px",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
};

const messageStyle = {
  marginTop: "12px",
  textAlign: "center",
  fontWeight: "600",
};

/* ===== MODAL ===== */

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  width: "420px",
  padding: "25px",
  borderRadius: "16px",
  background: "rgba(20,20,20,0.95)",
  color: "white",
  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
};

const summary = {
  fontSize: "14px",
  lineHeight: "1.6",
  marginBottom: "15px",
};

const actions = {
  display: "flex",
  gap: "12px",
};

const cancelBtn = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  background: "#374151",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const confirmBtn = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  border: "none",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

export default StockTransfer;
