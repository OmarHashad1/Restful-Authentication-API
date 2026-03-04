import { logger } from "../utils/winston.js";

const dataSources = ["body", "params", "query"];
export const validate = (schema) => {
  return (req, res, next) => {
    let validationErrors = [];
    dataSources.forEach((source) => {
      if (!schema[source]) return;
      const payload = schema[source].validate(req[source], {
        abortEarly: false,
        convert: false,
      });
      if (payload.error)
        validationErrors.push({
          [source]: payload.error.details.map((err) => err.message),
        });
    });

    if (validationErrors.length) {
      logger.warn(
        `Validation failed on ${req.method} ${req.originalUrl} `,
        {
          errors: validationErrors,
          ip: req.ip,
        },
      );
      return res
        .status(423)
        .json({ message: "validation failed", data: { ...validationErrors } });
    }
    logger.info(
      `Validation passed on ${req.method} ${req.originalUrl} `,
    );
    next();
  };
};
