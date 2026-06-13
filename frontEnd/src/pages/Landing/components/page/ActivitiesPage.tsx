import ActivitiesSection from "../sections/activities";

// TypeScript: this module is implemented as JS; treat as React component
const ActivitiesSectionAny = ActivitiesSection as unknown as React.ComponentType;

export default function ActivitiesPage() {

  return (
    <div className="min-h-screen">
      <ActivitiesSectionAny />

    </div>
  );
}
