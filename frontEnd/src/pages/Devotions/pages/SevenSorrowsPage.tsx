import ChapletViewer from "../components/ChapletViewer";
import { sevenSorrowsPrayers } from "../data/devotions/sevenSorrowsFull";

export default function SevenSorrowsPage() {
  return <ChapletViewer data={sevenSorrowsPrayers} />;
}
