#!/bin/bash

# Fix controllersreq.query types and parseInt issues
sed -i -E 's/req.query.([a-zA-Z]+) as string/req.query.\1 as string/g' src/controllers/*.ts
sed -i -E 's/const page = req.query.page \? parseInt\(req.query.page as string, 10\) : undefined;/const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;/g' src/controllers/*.ts
sed -i -E 's/const limit = req.query.limit \? parseInt\(req.query.limit as string, 10\) : undefined;/const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;/g' src/controllers/*.ts
sed -i 's/parseInt(req.query.page as string | undefined/parseInt(req.query.page as string/g' src/controllers/*.ts
sed -i 's/parseInt(req.query.limit as string | undefined/parseInt(req.query.limit as string/g' src/controllers/*.ts

# Also handle the cases where they are direct arguments
sed -i 's/req.params.conversationId,/req.params.conversationId as string,/g' src/controllers/*.ts
sed -i 's/req.params.userId,/req.params.userId as string,/g' src/controllers/*.ts
sed -i 's/req.params.messageId,/req.params.messageId as string,/g' src/controllers/*.ts
sed -i 's/req.params.notificationId,/req.params.notificationId as string,/g' src/controllers/*.ts

# Some controllers might be passing req.user._id directly where it expects string, but user._id is an ObjectId. 
# They should use toString() but let's just cast.
sed -i 's/req.user!._id,/req.user!._id.toString(),/g' src/controllers/*.ts
sed -i 's/req.user._id,/req.user!._id.toString(),/g' src/controllers/*.ts

# Fix Models delete __v
sed -i 's/delete (ret as Record<string, unknown>).__v;/delete (ret as any).__v;/g' src/models/*.ts
sed -i 's/delete ret.password;/delete (ret as any).password;/g' src/models/*.ts
sed -i 's/delete ret.refreshToken;/delete (ret as any).refreshToken;/g' src/models/*.ts

# Fix user public profile missing fields
sed -i 's/lastSeen: this.lastSeen,/lastSeen: this.lastSeen,\n    blockedUsers: this.blockedUsers,\n    notificationPreferences: this.notificationPreferences,/g' src/models/user.model.ts

# Fix pagination utils cast
sed -i 's/String((data\[data.length - 1\] as Record<string, unknown>)._id)/String((data[data.length - 1] as any)._id)/g' src/utils/pagination.utils.ts

# Fix message service emoji type
sed -i 's/emoji: string/emoji: ReactionEmoji/g' src/services/message.service.ts

