import { drizzle } from "drizzle-orm/neon-http";
import { chats, DBMessage, messages } from "./schema";
import { eq, asc, desc } from "drizzle-orm";
const db = drizzle(process.env.DATABASE_URL!);

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chats).values({
      id,
      userId,
      createdAt: new Date(),
      title,
    });
  } catch (error) {
    console.error("Failed to save chat to database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.userId, id))
      .orderBy(desc(chats.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user id from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat from database");
    throw error;
  }
}

export async function saveMessages({ message }: { message: Array<DBMessage> }) {
  try {
    return await db.insert(messages).values(message);
  } catch (error) {
    console.error("Failed to save messages to database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, id))
      .orderBy(asc(messages.createdAt));
  } catch (error) {
    console.error("Failed to get messages from database", error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(chats).where(eq(chats.id, id));
  } catch (error) {
    console.error("Failed to delete chat from database", error);
    throw error;
  }
}

export async function deleteMessageById({ id }: { id: string }) {
  try {
    await db.delete(messages).where(eq(messages.id, id));
  } catch (error) {
    console.error("Failed to delete message from database", error);
    throw error;
  }
}

export async function updateAnnotationByMessageId({
  messageId,
  annotations,
}: {
  messageId: string;
  annotations: JSON;
}) {
  try {
    await db
      .update(messages)
      .set({ annotations })
      .where(eq(messages.id, messageId));
  } catch (error) {
    console.error("Failed to update annotation by message id", error);
    throw error;
  }
}
