import ExploreMode from "@/components/explore-mode";
import { getChatById } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ExploreMode />
    </div>
  );
}
