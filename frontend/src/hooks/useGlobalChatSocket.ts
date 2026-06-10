import { useEffect, useState } from 'react';
import { getAccessToken, getStoredUser } from '../lib/auth';
import {
  connectGlobalChat,
  getGlobalChatState,
  sendGlobalChatMessage,
  subscribeGlobalChat,
} from '../services/globalChatSocket';

export function useGlobalChatSocket() {
  const [chatState, setChatState] = useState(getGlobalChatState);
  const user = getStoredUser();

  useEffect(() => subscribeGlobalChat(setChatState), []);

  useEffect(() => {
    connectGlobalChat(getAccessToken());
  }, []);

  return {
    ...chatState,
    currentUserId: user?.id,
    sendMessage: sendGlobalChatMessage,
  };
}
