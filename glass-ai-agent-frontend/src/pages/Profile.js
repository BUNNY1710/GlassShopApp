import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import dashboardBg from "../assets/dashboard-bg.jpg";
import api from "../api/api";

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/auth/profile")
      .then(res => setProfile(res.data))
      .catch(() => console.log("Failed to load profile"));
  }, []);

  if (!profile) return null;

  return (
    <PageWrapper background={dashboardBg}>
      <div style={card}>
        <h2>👤 My Profile</h2>

        <div style={row}>
          <span>Name</span>
          <b>{profile.username}</b>
        </div>

        <div style={row}>
          <span>Role</span>
          <b>{profile.role}</b>
        </div>

        <div style={row}>
          <span>Shop</span>
          <b>{profile.shopName}</b>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Profile;

/* ---------- STYLES ---------- */

const card = {
  width: "400px",
  margin: "100px auto",
  padding: "30px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.6)",
  color: "white",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "15px",
  fontSize: "16px"
};
