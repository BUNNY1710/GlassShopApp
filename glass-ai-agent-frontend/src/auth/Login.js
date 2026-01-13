// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../api/api";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     setError("");

//     try {
//       const res = await api.post("/auth/login", {
//         username,
//         password,
//       });

//       /*
//         Backend response MUST be:
//         {
//           token: "jwt-token",
//           role: "ROLE_ADMIN" | "ROLE_STAFF"
//         }
//       */

//       const { token, role } = res.data;

//       if (!token || !role) {
//         throw new Error("Invalid login response");
//       }

//       // ✅ STORE EXACT VALUES (DO NOT MODIFY ROLE)
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.role);

//       // 🔍 Debug (remove later)
//       console.log("Logged in as:", role);

//       navigate("/dashboard");
//     } catch (err) {
//       setError("Invalid username or password");
//     }
//   };

//   return (
//     <div style={container}>
//       <h2>🔐 Login</h2>

//       <input
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <button onClick={handleLogin}>Login</button>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <p>
//         New user? <Link to="/register">Register</Link>
//       </p>
//     </div>
//   );
// }

// const container = {
//   width: "300px",
//   margin: "100px auto",
//   display: "flex",
//   flexDirection: "column",
//   gap: "10px",
// };

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      // Handle error professionally - show inline message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          "Invalid username or password";
      setError(errorMessage);
    }
  };

  return (
    <div style={authBg}>
      <div style={authCard}>
        <h2 style={title}>🔐 Welcome Back</h2>
        <p style={subtitle}>Login to manage your glass inventory</p>

        <form onSubmit={handleLogin} style={formStyle}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            style={input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={input}
          />

          <button style={btn}>Login</button>
          
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
        </form>

        <p style={footerText}>
          New here?{" "}
          <span style={link} onClick={() => navigate("/register")}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}

const authBg = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #020617, #020617cc)",
};

const authCard = {
  width: "360px",
  padding: "30px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(15px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  color: "white",
  textAlign: "center"
};

const title = {
  fontSize: "22px",
  marginBottom: "6px",
  fontWeight: "700"
};

const subtitle = {
  fontSize: "13px",
  color: "#9ca3af",
  marginBottom: "20px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "14px"
};

const btn = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  marginTop: "8px"
};

const footerText = {
  marginTop: "16px",
  fontSize: "13px",
  color: "#9ca3af"
};

const link = {
  color: "#60a5fa",
  cursor: "pointer",
  fontWeight: "600"
};

const errorStyle = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "8px",
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#fca5a5",
  fontSize: "14px",
  textAlign: "center",
  fontWeight: "500"
};

export default Login;
