import ChapletViewer from "../components/ChapletViewer";
import { stMichaelPrayers } from "../data/devotions/stMichaelFull";

export default function StMichaelPage() {
  return <ChapletViewer data={stMichaelPrayers} />;
}
