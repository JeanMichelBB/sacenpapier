import { Hub } from "@/components/Hub";
import { getAllPostmortems } from "@/lib/postmortems";

export default function Page() {
  const postmortems = getAllPostmortems();
  return <Hub postmortems={postmortems} />;
}
