export const findOne = async ({ model, filter, select = {}, options = {} }) => {
  let query = model.findOne(filter).select(select);
  if (options.lean) query = query.lean();
  if (options.populate) query = query.populate();

  const doc = await query;
  return doc;
};

export const findByEmail = async ({
  model,
  email,
  select = "",
  options = {},
}) => {
  const doc = await findOne({
    model: model,
    filter: { email },
    select,
    options,
  });

  return doc;
};

export const create = async ({ model, data, options = {} }) => {
  const user = await model.create(Array.isArray(data) ? data : [data], options);
  return Array.isArray(data) ? user : user[0];
};

export const update = async ({
  model,
  filter,
  data,
  options = {},
  select = "",
}) => {
  const updateDoc = await model
    .findByIdAndUpdate(filter, data, options)
    .select(select);

  return updateDoc;
};

export const deleteOne = async ({ model, filter }) => {
  const doc = await model.deleteOne(filter);

  return doc;
};
