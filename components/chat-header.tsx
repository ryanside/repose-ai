"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { LayoutPanelLeft } from "lucide-react";
import { Message } from "@ai-sdk/react";

export default function ChatHeader({
  messages,
  toggleView,
  mobileView,
}: {
  messages: Message[];
  toggleView: () => void;
  mobileView: "chat" | "flow";
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b justify-between">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-red-200" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              Exploring:{" "}
              <span className="tracking-tight font-semibold animate-pulse">
                {messages[0].content}
              </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleView}
          className="md:hidden flex"
          aria-label="Toggle view"
        >
          <LayoutPanelLeft
            className={mobileView === "chat" ? "" : "text-primary"}
          />
        </Button>
      </div>
    </header>
  );
}
