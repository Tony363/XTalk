import React from "react";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      // Render error message
      return (
        <div className="error">
          <h3>Oops, something went wrong!</h3>
          <pre>
            <code style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {this.state.error?.toString()}
            </code>
          </pre>
        </div>
      );
    }
    // if no error occurred, render children
    return this.props.children;
  }
}
