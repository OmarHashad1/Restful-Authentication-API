
export const successRes = ({
  res,
  message = "Success",
  status = 200,
  data = null,
}) => {
  return data
    ? res.status(status).json({ message, data })
    : res.status(status).json({ message });
};

export const errorRes = ({
  res,
  message = "Something wrong went happening!",
  status = 400,
}) => {
  return res.status(status).json({ message });
};
