const generateId = (prefix, length = 8) => {
  const randomNum = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
  return `${prefix}${randomNum}`;
};

const generateUniqueId = async (model, prefix, field = 'customId') => {
  let id;
  let exists = true;
  
  while (exists) {
    id = generateId(prefix);
    // Check if ID already exists
    const existing = await model.findOne({ [field]: id });
    exists = !!existing;
  }
  
  return id;
};

module.exports = {
  generateUniqueId,
  PREFIXES: {
    PRODUCT: 'P',
    USER: 'U',
    VENDOR: 'V',
    ADMIN: 'A',
    ORDER: 'O'
  }
}; 