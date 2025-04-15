"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { LayoutPanelLeft, MessageSquare, BookOpen } from "lucide-react";
import { memo } from "react";

export default memo(ChatHeader);

function ChatHeader({
  firstMessageContent,
  toggleView,
  mobileView = "chat",
  mode = "explore",
}: {
  firstMessageContent: string;
  toggleView?: () => void;
  mobileView?: "chat" | "flow";
  mode?: "explore" | "learn";
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-red-200" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="max-w-[200px] sm:max-w-none overflow-hidden text-ellipsis whitespace-nowrap">
              {mode === "explore" ? (
                <>
                  Exploring:{" "}
                  <span className="tracking-tight font-semibold">
                    {firstMessageContent.substring(0, 30)}
                    {firstMessageContent.length > 30 ? "..." : ""}
                  </span>
                </>
              ) : (
                <>
                  Learning:{" "}
                  <span className="tracking-tight font-semibold">
                    {firstMessageContent.substring(0, 30)}
                    {firstMessageContent.length > 30 ? "..." : ""}
                  </span>
                </>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {toggleView && (
        <div className="flex items-center">
          <Button
            variant={mobileView === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={toggleView}
            className="md:hidden flex items-center gap-1 mr-1"
            aria-label="Chat View"
          >
            <MessageSquare className="size-4" />
            <span className="sr-only sm:not-sr-only">Chat</span>
          </Button>
          <Button
            variant={mobileView === "flow" ? "default" : "ghost"}
            size="sm"
            onClick={toggleView}
            className="md:hidden flex items-center gap-1"
            aria-label="Flow View"
          >
            <LayoutPanelLeft className="size-4" />
            <span className="sr-only sm:not-sr-only">Flow</span>
          </Button>
        </div>
      )}
    </header>
  );
}
