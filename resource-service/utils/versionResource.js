const ResourceVersion = require('../models/ResourceVersion');

async function saveResourceVersion(resourceDoc) {
  const data = resourceDoc.toObject();
  delete data._id;
  await ResourceVersion.create({
    ...data,
    resourceId: resourceDoc._id,
    updatedAt: new Date()
  });
}

module.exports = saveResourceVersion;
