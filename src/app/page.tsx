import { Hub } from "@/components/Hub";
import { getAllPostmortems } from "@/lib/postmortems";
import { getAllUpdates } from "@/lib/updates";

export default function Page() {
  const postmortems = getAllPostmortems();
  const updates = getAllUpdates();
  return <Hub postmortems={postmortems} updates={updates} />;
}
