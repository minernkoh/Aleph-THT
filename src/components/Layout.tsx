import { useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={5} />
      <line x1={12} y1={1} x2={12} y2={3} />
      <line x1={12} y1={21} x2={12} y2={23} />
      <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
      <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
      <line x1={1} y1={12} x2={3} y2={12} />
      <line x1={21} y1={12} x2={23} y2={12} />
      <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
      <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** Shared page shell (navbar + route outlet) for all pages. */
export function Layout() {
  const location = useLocation();
  const { mode, toggle } = useTheme();
  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " active" : ""}`;

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) main.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <>
      <a
        href="#main-content"
        className="visually-hidden visually-hidden-focusable position-absolute top-0 start-0 p-2 m-2 bg-light border border-secondary rounded text-decoration-none"
      >
        Skip to main content
      </a>
      <Navbar expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Process First LLC
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto" navbarScroll>
              <NavLink to="/task-1" className={navLinkClassName}>
                1. Table
              </NavLink>
              <NavLink to="/task-2" className={navLinkClassName}>
                2. Process Flow
              </NavLink>
              <NavLink to="/task-3" className={navLinkClassName}>
                3. Report
              </NavLink>
              <NavLink to="/task-4" className={navLinkClassName}>
                4. Dashboard
              </NavLink>
            </Nav>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            >
              {mode === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" tabIndex={-1}>
        <div key={location.pathname} className="route-fade-in">
          <Outlet />
        </div>
      </main>
    </>
  );
}
