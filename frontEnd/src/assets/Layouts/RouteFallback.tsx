import React from "react";
import PageLoader from "./PageLoader";

const RouteFallback: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-[60vh] w-full flex items-center justify-center">
    <PageLoader message={message} />
  </div>
);

export default RouteFallback;
