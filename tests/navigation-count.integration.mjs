import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require(require.resolve("@next/env", { paths: [require.resolve("next")] })).loadEnvConfig(
  process.cwd()
);
const { PrismaClient } = require("@prisma/client");
const {
  ConversationRepository
} = require("../shared/repositories/conversation.repository.ts");
const db = new PrismaClient();
const rollback = new Error("ROLLBACK_TEST_FIXTURES");
try {
  await db.$transaction(
    async (tx) => {
      const owner = randomUUID(),
        other = randomUUID();
      await tx.user.createMany({
        data: [
          { id: owner, email: `perf-${owner}@example.invalid` },
          { id: other, email: `perf-${other}@example.invalid` }
        ]
      });
      const old = new Date("2026-01-01T00:00:00Z"),
        recent = new Date("2026-01-02T00:00:00Z");
      for (const sample of [
        { lastReadAt: null, messages: [{ senderId: other, createdAt: old }] },
        { lastReadAt: recent, messages: [{ senderId: other, createdAt: recent }] },
        {
          lastReadAt: null,
          messages: [
            { senderId: other, createdAt: old },
            { senderId: owner, createdAt: recent }
          ]
        },
        { lastReadAt: null, messages: [] },
        { lastReadAt: old, messages: [{ senderId: other, createdAt: recent }] }
      ])
        await tx.conversation.create({
          data: {
            createdById: owner,
            participants: {
              create: [
                { userId: owner, lastReadAt: sample.lastReadAt },
                { userId: other }
              ]
            },
            messages: {
              create: sample.messages.map((message) => ({
                ...message,
                type: "TEXT",
                content: "Isolated count test"
              }))
            }
          }
        });
      const repository = new ConversationRepository(tx);
      const legacy = await repository.findForUser(owner);
      const expected = legacy.filter((conversation) => {
        const participant = conversation.participants.find(
            (item) => item.userId === owner
          ),
          message = conversation.messages[0];
        return (
          message &&
          message.senderId !== owner &&
          (!participant.lastReadAt || message.createdAt > participant.lastReadAt)
        );
      }).length;
      assert.equal(expected, 2);
      assert.equal(await repository.countUnreadForUser(owner), expected);
      assert.equal(await repository.countUnreadForUser(randomUUID()), 0);
      throw rollback;
    },
    { timeout: 60000 }
  );
} catch (error) {
  if (error !== rollback) throw error;
  console.log(
    "PASS: parameterized counter matches legacy semantics for latest own/other, read/unread, no messages and outsider. All fixtures rolled back."
  );
} finally {
  await db.$disconnect();
}
