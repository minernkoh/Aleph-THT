import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

/** Shared page shell (navbar + route outlet) for all pages. */
export function Layout() {
  const location = useLocation();
  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " active" : ""}`;
  return (
    <>
      {/* Accessibility: keyboard users can skip the navbar straight to content. */}
      <a
        href="#main-content"
        className="visually-hidden visually-hidden-focusable position-absolute top-0 start-0 p-2 m-2 bg-light border border-secondary rounded text-decoration-none"
      >
        Skip to main content
      </a>
      <Navbar bg="light" expand="lg" sticky="top" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Process First LLC
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto" navbarScroll>
              <NavLink
                to="/task-1"
                className={navLinkClassName}
              >
                1. Table
              </NavLink>
              <NavLink
                to="/task-2"
                className={navLinkClassName}
              >
                2. Process Flow
              </NavLink>
              <NavLink
                to="/task-3"
                className={navLinkClassName}
              >
                3. Report
              </NavLink>
              <NavLink
                to="/task-4"
                className={navLinkClassName}
              >
                4. Dashboard
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" tabIndex={-1}>
        {/* Re-mount on route change to restart the simple fade-in animation. */}
        <div key={location.pathname} className="route-fade-in">
          <Outlet />
        </div>
      </main>
    </>
  );
}

