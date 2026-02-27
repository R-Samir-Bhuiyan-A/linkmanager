const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Settings = require('../models/Settings');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

class BackupService {
    constructor() {
        this.job = null;
    }

    async init() {
        const settings = await Settings.findOne();
        if (settings && settings.backups.enabled) {
            this.schedule(settings.backups.frequency);
        }
    }

    schedule(frequency) {
        if (this.job) this.job.stop();

        // daily: 0 0 * * * (Midnight)
        // weekly: 0 0 * * 0 (Sunday Midnight)
        const cronExpression = frequency === 'weekly' ? '0 0 * * 0' : '0 0 * * *';

        this.job = cron.schedule(cronExpression, async () => {
            console.log('Starting execution of automatic backup...');
            await this.performBackup();
        });

        console.log(`Backup scheduled: ${frequency} (${cronExpression})`);
    }

    async stop() {
        if (this.job) this.job.stop();
        console.log('Backup schedule stopped');
    }

    async performBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

        fs.mkdirSync(backupPath);

        try {
            const collections = await mongoose.connection.db.listCollections().toArray();

            for (const collection of collections) {
                const name = collection.name;
                const data = await mongoose.connection.db.collection(name).find().toArray();

                fs.writeFileSync(
                    path.join(backupPath, `${name}.json`),
                    JSON.stringify(data, null, 2)
                );
            }

            // Update last backup time
            await Settings.findOneAndUpdate({}, {
                'backups.lastBackup': new Date()
            }, { returnDocument: 'after' });

            console.log(`Backup completed successfully at ${backupPath}`);
            return { success: true, path: backupPath, timestamp };
        } catch (err) {
            console.error('Backup failed:', err);
            return { success: false, error: err.message };
        }
    }

    getBackups() {
        if (!fs.existsSync(BACKUP_DIR)) return [];

        return fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('backup-'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    createdAt: stats.birthtime,
                    size: this.getFolderSize(filePath) // Rough estimate
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    getFolderSize(folderPath) {
        // Simple recursive size
        let total = 0;
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            files.forEach(file => {
                const stats = fs.statSync(path.join(folderPath, file));
                total += stats.size;
            });
        }
        return total;
    }

    async createZip(folderName) {
        return new Promise((resolve, reject) => {
            const archiver = require('archiver');
            const sourceDir = path.join(BACKUP_DIR, folderName);
            const outputZip = path.join(BACKUP_DIR, `${folderName}.zip`);

            if (!fs.existsSync(sourceDir)) {
                return reject(new Error('Backup folder not found'));
            }

            const output = fs.createWriteStream(outputZip);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve(outputZip));
            archive.on('error', (err) => reject(err));

            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }

    getBackupPath(folderName) {
        return path.join(BACKUP_DIR, folderName);
    }
}

module.exports = new BackupService();
