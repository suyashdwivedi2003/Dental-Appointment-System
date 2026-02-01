const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_clinic';
            
            mongoose.set('strictQuery', true);
            
            this.connection = await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            console.log('✅ Database connected successfully');
            
            // Handle connection events
            mongoose.connection.on('connected', () => {
                console.log('Mongoose connected to database');
            });
            
            mongoose.connection.on('error', (err) => {
                console.error('Mongoose connection error:', err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose disconnected from database');
            });
            
            // Graceful shutdown
            process.on('SIGINT', this.disconnect.bind(this));
            process.on('SIGTERM', this.disconnect.bind(this));
            
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('Database disconnected');
        } catch (error) {
            console.error('Error disconnecting database:', error);
        }
    }

    getConnection() {
        return this.connection;
    }

    async isConnected() {
        return mongoose.connection.readyState === 1;
    }

    async getStats() {
        try {
            const admin = mongoose.connection.db.admin();
            const stats = await admin.serverStatus();
            return {
                version: stats.version,
                uptime: stats.uptime,
                connections: stats.connections,
                memory: stats.mem
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            return null;
        }
    }
}

module.exports = new Database();