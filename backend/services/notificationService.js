const { getIO } = require('./socket');

const notificationService = {
  notifyVendor: (vendorId, notification) => {
    const io = getIO();
    io.to(`vendor-${vendorId}`).emit('notification', notification);
  },

  notifyOrderUpdate: (vendorId, orderId, status) => {
    const io = getIO();
    io.to(`vendor-${vendorId}`).emit('order-update', {
      orderId,
      status,
      timestamp: new Date()
    });
  },

  notifyNewOrder: (vendorId, order) => {
    const io = getIO();
    io.to(`vendor-${vendorId}`).emit('new-order', {
      order,
      timestamp: new Date()
    });
  }
};

module.exports = notificationService; 