export const requestedAt = (req, res, next) => {
  req.requestedAt = new Date();
  next();
};
