# 🔌 Socket.IO Implementation Guide

This directory will contain the Socket.IO real-time implementation.
The architecture is ready — you'll implement the handlers step by step.

## Directory Structure (Future)

```
socket/
├── index.ts              # Server initialization (done - skeleton)
├── middlewares/
│   └── auth.middleware.ts # Socket authentication
└── handlers/
    ├── connection.handler.ts
    ├── message.handler.ts
    ├── conversation.handler.ts
    ├── typing.handler.ts
    └── presence.handler.ts
```

## Event Map

### Client → Server
- `join_conversation` — Join a conversation room
- `leave_conversation` — Leave a conversation room
- `typing_start` — User started typing
- `typing_stop` — User stopped typing
- `message_delivered` — Message was delivered to client
- `message_read` — Message was read by user

### Server → Client
- `new_message` — New message in a conversation
- `message_edited` — A message was edited
- `message_deleted` — A message was deleted
- `reaction_updated` — A reaction was added/removed
- `user_online` — A user came online
- `user_offline` — A user went offline
- `typing` — Someone is typing in a conversation
- `conversation_updated` — Conversation info changed
- `member_added` — New member added to group
- `member_removed` — Member removed from group
- `notification` — New notification
