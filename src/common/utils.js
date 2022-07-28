module.exports = {
  getValidOperationStatus(body, updatesArr) {
    const updates = Object.keys(body);
    const allowedUpdates = updatesArr;

    return updates.every((update) => allowedUpdates.includes(update));
  },
};
