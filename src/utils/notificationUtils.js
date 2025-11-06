export const showBrowserNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }
  
  if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }
};

export const getLeadSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case "whatsapp":
      return "fab fa-whatsapp text-success";
    case "metaads":
      return "fab fa-facebook text-primary";
    case "website":
      return "fas fa-globe text-info";
    default:
      return "fas fa-user text-secondary";
  }
};

// Export as default as well for flexibility
export default {
  showBrowserNotification,
  getLeadSourceIcon
};