export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  let messageDate;
  
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    messageDate = new Date(timestamp);
  } else {
    messageDate = new Date();
  }
  
  if (isNaN(messageDate.getTime())) {
    messageDate = new Date();
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (messageDate >= today) {
    return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (messageDate >= yesterday) {
    return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return messageDate.toLocaleDateString() + ' at ' + 
           messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

export const formatDateLabel = (date) => {
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
};

export const groupMessagesByDate = (conversations) => {
  if (!conversations || !conversations.length) return [];
  
  const groups = [];
  let currentGroup = null;
  
  conversations.forEach((message) => {
    let messageDate;
    
    if (message.timestamp) {
      messageDate = new Date(message.timestamp);
      if (isNaN(messageDate.getTime())) {
        messageDate = new Date();
      }
    } else {
      messageDate = new Date();
    }
    
    const dateKey = messageDate.toDateString();
    
    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        date: messageDate,
        dateKey: dateKey,
        dateLabel: formatDateLabel(messageDate),
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
};

// Default export for convenience
export default {
  formatMessageTime,
  formatDateLabel,
  groupMessagesByDate
};