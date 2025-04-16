import { generateUUID } from "@/lib/utils";
import LearnChat from "./learn-chat";

export default function LearnMode({
  modeHandler,
}: {
  modeHandler?: (mode: "explore" | "learn") => void;
}) {
  const id = generateUUID();
  return (
    <LearnChat
      id={id}
      key={id}
      initialMessages={[]}
      modeHandler={modeHandler}
    />
  );
}
