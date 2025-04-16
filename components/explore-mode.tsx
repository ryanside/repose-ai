import { generateUUID } from "@/lib/utils";
import ExploreChat from "./explore-chat";

export default function ExploreMode({
  modeHandler,
}: {
  modeHandler?: (mode: "explore" | "learn") => void;
}) {
  const id = generateUUID();
  return (
    <ExploreChat
      id={id}
      key={id}
      initialMessages={[]}
      initialNodes={[]}
      initialEdges={[]}
      modeHandler={modeHandler}
    />
  );
}
