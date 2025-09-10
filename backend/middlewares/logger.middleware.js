const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.originalUrl} at ${new Date().toISOString()}`
  );
  next();
};

export default logger;
