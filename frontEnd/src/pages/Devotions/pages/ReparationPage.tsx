import ChapletViewer from "../components/ChapletViewer";
import { reparationPrayers } from "../data/devotions/reparationFull";

export default function ReparationPage() {
  return <ChapletViewer data={reparationPrayers} />;
}
