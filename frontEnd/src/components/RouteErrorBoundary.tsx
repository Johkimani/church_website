import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

const RouteErrorBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.key}>
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;
