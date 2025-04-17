import { generateUUID } from "@/lib/utils";
import ExploreChat from "./explore-chat";

export default async function ExploreMode() {
  const id = generateUUID();
  return (
    <ExploreChat
      id={id}
      key={id}
      initialMessages={[]}
      initialNodes={[]}
      initialEdges={[]}
    />
  );
}
