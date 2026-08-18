module.exports = (err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: msgs.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
};
