import Topbar from "@/components/Topbar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useMemo } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const { user } = useAuthStore();
  const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();
  const lastSeenOwnMessageId = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.senderId === user?._id && message.readAt)
        ?._id,
    [messages, user?._id],
  );

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
  }, [selectedUser, fetchMessages]);

  return (
    <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
      <Topbar />

      <div className="grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]">
        <UsersList />

        {/* chat message */}
        <div className="flex flex-col h-full">
          {selectedUser ? (
            <>
              <ChatHeader />

              {/* Messages */}
              <ScrollArea className="h-[calc(100vh-340px)]">
                <div className="p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user?._id;
                    const showSeen =
                      isOwnMessage && message._id === lastSeenOwnMessageId;

                    return (
                      <div
                        key={message._id}
                        className={`flex items-start gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="size-8">
                          <AvatarImage
                            src={
                              isOwnMessage
                                ? user?.imageUrl
                                : selectedUser.imageUrl
                            }
                          />
                        </Avatar>

                        <div className="max-w-[70%]">
                          <div
                            className={`rounded-lg p-3 ${isOwnMessage ? "bg-green-500" : "bg-zinc-800"}`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className="text-xs text-zinc-300 mt-1 block">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          {showSeen && (
                            <span className="mt-1 block text-right text-xs text-zinc-500">
                              Seen
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <MessageInput />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </main>
  );
};
export default ChatPage;

const NoConversationPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6">
    <img src="/logo.png" alt="Aurora" className="size-16 animate-bounce" />
    <div className="text-center">
      <h3 className="text-zinc-300 text-lg font-medium mb-1">
        No conversation selected
      </h3>
      <p className="text-zinc-500 text-sm">Choose a friend to start chatting</p>
    </div>
  </div>
);
