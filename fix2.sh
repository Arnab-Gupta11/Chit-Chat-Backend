#!/bin/bash

# Fix the invalid bitwise operator from previous sed
sed -i -E 's/const cursor = \(req.query.cursor as string\) \| undefined;/const cursor = (req.query.cursor as string) || undefined;/g' src/controllers/*.ts
sed -i -E 's/const q = \(req.query.q as string\) \| undefined;/const q = (req.query.q as string) || undefined;/g' src/controllers/*.ts

# Fix missing params cast
sed -i 's/const conversationId = req.params.conversationId;/const conversationId = req.params.conversationId as string;/g' src/controllers/*.ts
sed -i 's/const userId = req.params.userId;/const userId = req.params.userId as string;/g' src/controllers/*.ts
sed -i 's/const messageId = req.params.messageId;/const messageId = req.params.messageId as string;/g' src/controllers/*.ts
sed -i 's/const notificationId = req.params.notificationId;/const notificationId = req.params.notificationId as string;/g' src/controllers/*.ts
sed -i 's/const targetUserId = req.params.userId;/const targetUserId = req.params.userId as string;/g' src/controllers/*.ts

# Fix message controller specific issues
sed -i 's/req.params.conversationId,/req.params.conversationId as string,/g' src/controllers/message.controller.ts
sed -i 's/await messageService.getMessages(conversationId, userId, cursor, limit);/await messageService.getMessages(conversationId, userId, cursor as string | undefined, limit);/g' src/controllers/message.controller.ts
sed -i 's/await notificationService.getNotifications(userId, cursor, limit);/await notificationService.getNotifications(userId, cursor as string | undefined, limit);/g' src/controllers/notification.controller.ts

# Fix message service missing ReactionEmoji import
sed -i 's/import type { MessageType } from '"'"'..\/utils\/constants'"'"';/import type { MessageType, ReactionEmoji } from '"'"'..\/utils\/constants'"'"';/g' src/services/message.service.ts

# Fix multer.ts FileFilterCallback
sed -i 's/import multer, { type FileFilterCallback }/import multer from "multer";\nimport { type FileFilterCallback }/g' src/config/multer.ts

