// Socket.IO event name constants shared between client & server

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_STATUS: 'message:status',
  MESSAGE_DELETE: 'message:delete',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  TYPING_INDICATOR: 'typing:indicator',

  // User Status
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_STATUS: 'user:status',

  // Groups
  GROUP_CREATE: 'group:create',
  GROUP_UPDATE: 'group:update',
  GROUP_MEMBER_ADD: 'group:member:add',
  GROUP_MEMBER_REMOVE: 'group:member:remove',

  // Notifications
  NOTIFICATION: 'notification',

  // Errors
  ERROR: 'error',
};
