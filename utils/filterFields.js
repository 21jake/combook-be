const filterFields = (input, allowedFields) => {
  const output = { ...input };
  for (const key in input) {
    if (!allowedFields.includes(key)) {
      delete output[key];
    }
  }
  return output;
};

module.exports = filterFields;
