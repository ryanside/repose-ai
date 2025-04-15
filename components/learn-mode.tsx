import { generateUUID } from "@/lib/utils";
import LearnChat from "./learn-chat";

export default function LearnMode() {
  const id = generateUUID();
  return <LearnChat id={id} key={id} initialMessages={[]} />;
}
