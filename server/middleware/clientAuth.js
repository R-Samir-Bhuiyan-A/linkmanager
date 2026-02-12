/**
 * Client Authentication Middleware / Logic Helper
 * 
 * Logic:
 * 1. Check if project has clientAuth.enabled = true
 * 2. If enabled, check for x-client-id and x-secret headers.
 * 3. If headers match project.publicId and project.secretKey, return FULL data.
 * 4. If headers missing/invalid:
 *    - Return ONLY the fields specified in project.clientAuth.publicFields.
 *    - If no publicFields, return 401/403.
 */

const filterResponse = (data, publicFields) => {
    if (!publicFields || publicFields.length === 0) return {};

    // If data is a Mongoose document, convert to object
    const obj = data.toObject ? data.toObject() : data;
    const filtered = {};

    publicFields.forEach(field => {
        if (obj[field] !== undefined) {
            filtered[field] = obj[field];
        }
    });

    return filtered;
};

module.exports = { filterResponse };
