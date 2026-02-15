const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map((detail) => detail.message).join(", ");
    res.status(400);
    throw new Error(errMsg);
  }

  next();
};
module.exports = validate;
