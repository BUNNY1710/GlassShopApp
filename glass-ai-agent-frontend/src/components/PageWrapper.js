// function PageWrapper({ background, children }) {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         backgroundImage: `url(${background})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         position: "relative",
//       }}
//     >
//       {/* Overlay */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "rgba(0,0,0,0.6)",
//           zIndex: 0,
//         }}
//       />

//       {/* Content */}
//       <div
//         style={{
//           position: "relative",
//           zIndex: 1,
//           minHeight: "calc(100vh - 64px)",
//           padding:  "clamp(12px, 4vw, 40px)",
//           color: "white",
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// export default PageWrapper;

function PageWrapper({ background, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: background ? `url(${background})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay - Lighter for modern theme */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: background 
            ? "rgba(0,0,0,0.3)" 
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 64px)",
          padding: "clamp(12px, 4vw, 40px)", // ✅ RESPONSIVE PADDING
          color: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;
