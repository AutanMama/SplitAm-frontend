const Expense = require('../models/Expense');
const Group = require('../models/Group');

exports.processSyncQueue = async (userId, queue) => {
  const results = [];
  for (const item of queue) {
    try {
      if (item.type === 'CREATE_EXPENSE') {
        const newExpense = new Expense({ ...item.payload, paidBy: userId });
        await newExpense.save();
        results.push({ tempId: item.tempId, status: 'synced', id: newExpense._id });
      }
      // Add other types like AJO_CONTRIBUTION here
    } catch (err) {
      results.push({ tempId: item.tempId, status: 'failed', error: err.message });
    }
  }
  return results;
};