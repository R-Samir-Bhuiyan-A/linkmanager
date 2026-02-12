const mongoose = require('mongoose');

const ConfigItemSchema = new mongoose.Schema({
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string, number, boolean, object
    environment: { type: String, enum: ['prod', 'staging', 'dev'], required: true },
    isEnabled: { type: Boolean, default: true },
});

const ConfigSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    items: [ConfigItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique key per environment per project
// Actually, it's better to store configs as documents? Or embedded in project?
// Separating it allows for history/versioning easier later, but embedding is simpler.
// Let's stick to separate collection for scalability if many configs.
// Wait, 'items' array inside one document per project might be bad if list grows.
// Better: Each config item is a document.
// Let's re-do the schema to be single item per document.

/* 
Revised Schema:
Each document represents ONE configuration key-value pair for ONE environment.
*/

const ConfigEntrySchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    key: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    environment: { type: String, enum: ['prod', 'staging', 'dev'], required: true, index: true },
    isEnabled: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

ConfigEntrySchema.index({ projectId: 1, environment: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Config', ConfigEntrySchema);
