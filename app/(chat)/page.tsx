"use client";

import ModeSwitcher from "@/components/mode-switcher";

export default function Chat() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ModeSwitcher />
    </div>
  );
}
