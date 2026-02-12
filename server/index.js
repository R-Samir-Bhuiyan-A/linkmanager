require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(require('./middleware/tracker'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkmanager')
    .then(() => {
        console.log('MongoDB connected');
        require('./services/BackupService').init();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('LinkManager API is running');
});

const projectsRouter = require('./routes/projects');
const configsRouter = require('./routes/configs');
const accessRouter = require('./routes/access');
const clientRouter = require('./routes/client');
const instancesRouter = require('./routes/instances');
const authRouter = require('./routes/auth');
const analyticsRouter = require('./routes/analytics');
const teamRouter = require('./routes/team');
const settingsRouter = require('./routes/settings');

app.use('/api/projects', projectsRouter); // TODO: Protect this
app.use('/api/configs', configsRouter);   // TODO: Protect this
app.use('/api/access', accessRouter);     // TODO: Protect this
app.use('/api/instances', instancesRouter); // TODO: Protect this
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/team', teamRouter);
app.use('/api/settings', settingsRouter);
app.use('/v1', clientRouter); // Public

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
