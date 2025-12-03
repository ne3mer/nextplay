import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

// Add connection event listeners for better debugging
mongoose.connection.on('connected', () => {
  logger.info('📦 MongoDB connected successfully');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB connection error', { error });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

export const connectDatabase = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);
    logger.info('📦 Connected to MongoDB', { 
      uri: env.MONGODB_URI,
      dbName: connection.connection.db?.databaseName,
      readyState: mongoose.connection.readyState 
    });
    
    // Verify connection by checking database
    const dbName = connection.connection.db?.databaseName;
    if (dbName) {
      const collections = await connection.connection.db.listCollections().toArray();
      logger.info(`📚 Database "${dbName}" has ${collections.length} collections:`, 
        collections.map(c => c.name).join(', '));
    }
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { 
      error,
      uri: env.MONGODB_URI,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
};
