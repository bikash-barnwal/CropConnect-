const sendResponse = (res, statusCode, status, message, data = null, error = null) => {
  const response = {
    status,
    status_code: statusCode,
    message,
    timestamp: new Date().toISOString(),
    data
  };
  if (error) {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendResponse };
