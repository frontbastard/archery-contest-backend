module.exports = {
  getValidOperationStatus(updates, allowedUpdates) {
    return updates.every((update) => allowedUpdates.includes(update));
  },
};
