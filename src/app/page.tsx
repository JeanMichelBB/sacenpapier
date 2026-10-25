import { Hub } from "@/components/Hub";
import { getAllWriting } from "@/lib/getWriting";

export default function Page() {
  const writing = getAllWriting();
  return <Hub writing={writing} />;
}
