import ChapletViewer from "../components/ChapletViewer";
import { divineMercyPrayers } from "../data/devotions/divineMercyFull";

export default function DivineMercyPage() {
  return <ChapletViewer data={divineMercyPrayers} />;
}
