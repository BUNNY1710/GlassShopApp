// // import { NavLink, useNavigate } from "react-router-dom";
// // import ProfileMenu from "./ProfileMenu";
// // // import { Link } from "react-router-dom";

// // function Navbar() {
// //   const navigate = useNavigate();
// //   const role = localStorage.getItem("role");

// //   return (
// //     <nav style={navBar}>
// //       {/* LEFT */}
// //       <div style={logo} onClick={() => navigate("/dashboard")}>
// //         🧱 Glass Shop
// //       </div>

// //       {/* CENTER MENU */}
// //       <div style={menu}>
// //         <NavLink to="/dashboard" style={link}>Dashboard</NavLink>
// //         <NavLink to="/manage-stock" style={link}>Manage Stock</NavLink>
// //         <NavLink to="/view-stock" style={link}>View Stock</NavLink>
// //         <NavLink to="/stock-transfer">🔁 Transfer Stock</NavLink>


// //         {role === "ROLE_ADMIN" && (
// //           <>
// //             <NavLink to="/ai" style={link}>AI Assistant</NavLink>
// //             <NavLink to="/audit" style={link}>Audit Logs</NavLink>
// //             <NavLink to="/create-staff" style={link}>Create Staff</NavLink>
// //           </>
// //         )}
// //       </div>

// //       {/* RIGHT PROFILE */}
// //       <div style={profileWrapper}>
// //         <ProfileMenu />
// //       </div>
// //     </nav>
// //   );
// // }

// // export default Navbar;

// // /* ================= STYLES ================= */

// // const navBar = {
// //   position: "fixed",
// //   top: 0,
// //   left: 0,
// //   right: 0,
// //   height: "64px",
// //   zIndex: 10000,   // 🔥 ABOVE PageWrapper
// //   display: "flex",
// //   justifyContent: "space-between",
// //   alignItems: "center",
// //   padding: "0 30px",
// //   background: "rgba(0,0,0,0.85)",
// //   backdropFilter: "blur(10px)",
// // };


// // const logo = {
// //   color: "#f9fafb",
// //   fontWeight: "800",
// //   fontSize: "18px",
// //   cursor: "pointer",
// // };

// // const menu = {
// //   display: "flex",
// //   gap: "22px",
// // };

// // const link = {
// //   color: "#d1d5db",
// //   textDecoration: "none",
// //   fontSize: "14px",
// // };

// // const profileWrapper = {
// //   display: "flex",
// //   alignItems: "center",
// // };

// import { NavLink, useNavigate } from "react-router-dom";
// import ProfileMenu from "./ProfileMenu";

// function Navbar() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");

//   return (
//     <nav style={navBar}>
//       {/* LEFT */}
//       <div style={logo} onClick={() => navigate("/dashboard")}>
//         🧱 Glass Shop
//       </div>

//       {/* CENTER MENU */}
//       <div style={menu}>
//         <NavLink to="/dashboard" style={navLinkStyle}>
//           Dashboard
//         </NavLink>

//         <NavLink to="/manage-stock" style={navLinkStyle}>
//           Manage Stock
//         </NavLink>

//         <NavLink to="/view-stock" style={navLinkStyle}>
//           View Stock
//         </NavLink>

//         {/* ✅ FIXED: SAME STYLE AS OTHERS */}
//         <NavLink to="/stock-transfer" style={navLinkStyle}>
//           🔁 Transfer Stock
//         </NavLink>

//         {role === "ROLE_ADMIN" && (
//           <>
//             <NavLink to="/ai" style={navLinkStyle}>
//               AI Assistant
//             </NavLink>

//             <NavLink to="/audit" style={navLinkStyle}>
//               Audit Logs
//             </NavLink>

//             <NavLink to="/create-staff" style={navLinkStyle}>
//               Create Staff
//             </NavLink>
//           </>
//         )}
//       </div>

//       {/* RIGHT PROFILE */}
//       <div style={profileWrapper}>
//         <ProfileMenu />
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

// /* ================= STYLES ================= */

// const navBar = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   right: 0,
//   height: "64px",
//   zIndex: 10000,
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   padding: "0 30px",
//   background: "rgba(0,0,0,0.85)",
//   backdropFilter: "blur(10px)",
// };

// const logo = {
//   color: "#f9fafb",
//   fontWeight: "800",
//   fontSize: "18px",
//   cursor: "pointer",
// };

// // const menu = {
// //   display: "flex",
// //   gap: "22px",
// // };
// const menu = {
//   display: "flex",
//   gap: "14px",
//   overflowX: "auto",
//   whiteSpace: "nowrap",
// };


// /* ✅ ACTIVE + NORMAL STYLE HANDLED HERE */
// const navLinkStyle = ({ isActive }) => ({
//   color: isActive ? "#ffffff" : "#d1d5db",
//   textDecoration: "none",
//   fontSize: "14px",
//   fontWeight: isActive ? "600" : "500",
//   padding: "6px 10px",
//   borderRadius: "6px",
//   background: isActive ? "rgba(37, 99, 235, 0.35)" : "transparent",
//   transition: "all 0.2s ease",
// });

// const profileWrapper = {
//   display: "flex",
//   alignItems: "center",
// };




// import { NavLink, useNavigate } from "react-router-dom";
// import ProfileMenu from "./ProfileMenu";
// // import { Link } from "react-router-dom";

// function Navbar() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");

//   return (
//     <nav style={navBar}>
//       {/* LEFT */}
//       <div style={logo} onClick={() => navigate("/dashboard")}>
//         🧱 Glass Shop
//       </div>

//       {/* CENTER MENU */}
//       <div style={menu}>
//         <NavLink to="/dashboard" style={link}>Dashboard</NavLink>
//         <NavLink to="/manage-stock" style={link}>Manage Stock</NavLink>
//         <NavLink to="/view-stock" style={link}>View Stock</NavLink>
//         <NavLink to="/stock-transfer">🔁 Transfer Stock</NavLink>


//         {role === "ROLE_ADMIN" && (
//           <>
//             <NavLink to="/ai" style={link}>AI Assistant</NavLink>
//             <NavLink to="/audit" style={link}>Audit Logs</NavLink>
//             <NavLink to="/create-staff" style={link}>Create Staff</NavLink>
//           </>
//         )}
//       </div>

//       {/* RIGHT PROFILE */}
//       <div style={profileWrapper}>
//         <ProfileMenu />
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

// /* ================= STYLES ================= */

// const navBar = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   right: 0,
//   height: "64px",
//   zIndex: 10000,   // 🔥 ABOVE PageWrapper
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   padding: "0 30px",
//   background: "rgba(0,0,0,0.85)",
//   backdropFilter: "blur(10px)",
// };


// const logo = {
//   color: "#f9fafb",
//   fontWeight: "800",
//   fontSize: "18px",
//   cursor: "pointer",
// };

// const menu = {
//   display: "flex",
//   gap: "22px",
// };

// const link = {
//   color: "#d1d5db",
//   textDecoration: "none",
//   fontSize: "14px",
// };

// const profileWrapper = {
//   display: "flex",
//   alignItems: "center",
// };










import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <nav style={navBar}>
      {/* LEFT LOGO */}
      <div style={logo} onClick={() => navigate("/dashboard")}>
        <span style={{ fontSize: "24px" }}>🧱</span>
        <span>Glass Shop</span>
      </div>

      {/* RIGHT SIDE (MOBILE) */}
      <div style={rightBar}>
        {/* HAMBURGER */}
        {isMobile && (
          <button style={hamburger} onClick={() => setOpen(!open)}>
            ☰
          </button>
        )}

        {/* ✅ PROFILE ICON ALWAYS VISIBLE */}
        <ProfileMenu />
      </div>

      {/* MENU */}
      <div
        style={{
          ...menu,
          display: isMobile ? (open ? "flex" : "none") : "flex",
          flexDirection: isMobile ? "column" : "row",
          position: isMobile ? "absolute" : "static",
          top: "70px",
          left: 0,
          right: 0,
          background: isMobile 
            ? "rgba(255, 255, 255, 0.98)" 
            : "transparent",
          padding: isMobile ? "16px" : "0",
          boxShadow: isMobile 
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            : "none",
          borderBottom: isMobile ? "1px solid rgba(226, 232, 240, 0.8)" : "none",
        }}
      >
        <NavLink to="/dashboard" style={navLinkStyle} onClick={() => setOpen(false)}>
          <span>📊</span> Dashboard
        </NavLink>

        <NavLink to="/manage-stock" style={navLinkStyle} onClick={() => setOpen(false)}>
          <span>➕</span> Manage Stock
        </NavLink>

        <NavLink to="/view-stock" style={navLinkStyle} onClick={() => setOpen(false)}>
          <span>📦</span> View Stock
        </NavLink>

        {role === "ROLE_ADMIN" && (
          <>
            <NavLink to="/ai" style={navLinkStyle} onClick={() => setOpen(false)}>
              <span>🤖</span> AI Assistant
            </NavLink>

            <NavLink to="/audit" style={navLinkStyle} onClick={() => setOpen(false)}>
              <span>📜</span> Audit Logs
            </NavLink>

            <NavLink to="/create-staff" style={navLinkStyle} onClick={() => setOpen(false)}>
              <span>👤</span> Create Staff
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

/* ================= STYLES ================= */

const navBar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "70px",
  zIndex: 10000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
};

const logo = {
  color: "#4f46e5",
  fontWeight: "800",
  fontSize: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
};

const rightBar = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const menu = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? "#4f46e5" : "#64748b",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: isActive ? "600" : "500",
  padding: "10px 16px",
  borderRadius: "8px",
  background: isActive 
    ? "rgba(99, 102, 241, 0.1)" 
    : "transparent",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  position: "relative",
});

const hamburger = {
  fontSize: "24px",
  background: "transparent",
  border: "none",
  color: "#475569",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};
