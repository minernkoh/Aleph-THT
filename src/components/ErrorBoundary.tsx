import type { ReactNode } from "react";
import { Component } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

type Props = {
  children: ReactNode;
};

type State = {
  error: unknown | null;
  errorPath: string | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorPath: null };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  componentDidCatch(): void {
    this.setState({ errorPath: window.location.pathname || "/" });
  }

  render() {
    if (this.state.error) {
      const path = (this.state.errorPath ?? window.location.pathname) || "this page";
      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <div className="mb-3">
              An error occurred while loading <strong>{path === "/" ? "the home page" : path}</strong>.
              Reload the page to try again. If it happens again, try another section from the navbar
              or note what you were doing and report it.
            </div>
            <Button onClick={() => window.location.reload()} variant="outline-danger">
              <span className="d-inline-flex align-items-center gap-1">
                <ArrowClockwiseIcon size={18} aria-hidden="true" />
                Reload
              </span>
            </Button>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

