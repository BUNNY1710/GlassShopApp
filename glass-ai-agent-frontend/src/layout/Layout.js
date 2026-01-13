import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "70px" }}>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
