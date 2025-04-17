import { useQuery } from "@tanstack/react-query";
import { getHistoryByUserId } from "@/app/(chat)/actions";
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { Chat } from "@/lib/db/schema";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

import Link from "next/link";
import { memo } from "react";
import { useParams, usePathname } from "next/navigation";
type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const PureChatItem = ({
  chat,
  isActive,
}: {
  chat: Chat;
  isActive: boolean;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/explore/${chat.id}`}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

export function SidebarHistory({ userId }: { userId: string | undefined }) {
  const { id } = useParams();
  const pathname = usePathname();
  const { data: history, isLoading } = useQuery({
    queryKey: ["history", pathname, userId],
    queryFn: () => getHistoryByUserId(userId!),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupContent>
          <div className="px-2">Login to save and revisit previous chats!</div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      "--skeleton-width": `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (Array.isArray(history) && history.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);

        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats
    );
  };

  return (
    <SidebarMenu className="px-2">
      {Array.isArray(history) &&
        (() => {
          const groupedChats = groupChatsByDate(history);

          return (
            <>
              {groupedChats.today.length > 0 && (
                <>
                  <div className="py-1 text-xs text-sidebar-foreground/50">
                    Today
                  </div>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                    />
                  ))}
                </>
              )}

              {groupedChats.yesterday.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                    />
                  ))}
                </>
              )}

              {groupedChats.lastWeek.length > 0 && (
                <>
                  <div className="py-1 text-xs text-sidebar-foreground/50 mt-6">
                    Last 7 days
                  </div>
                  {groupedChats.lastWeek.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                    />
                  ))}
                </>
              )}

              {groupedChats.lastMonth.length > 0 && (
                <>
                  <div className="py-1 text-xs text-sidebar-foreground/50 mt-6">
                    Last 30 days
                  </div>
                  {groupedChats.lastMonth.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                    />
                  ))}
                </>
              )}

              {groupedChats.older.length > 0 && (
                <>
                  <div className="py-1 text-xs text-sidebar-foreground/50 mt-6">
                    Older
                  </div>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === id}
                    />
                  ))}
                </>
              )}
            </>
          );
        })()}
    </SidebarMenu>
  );
}
