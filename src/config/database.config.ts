import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get<string>('database.uri'),
  retryWrites: true,
  retryDelay: 500,
  retryAttempts: 3,
  connectionFactory: (connection) => {
    connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });
    connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });
    connection.on('error', (error) => {
      console.log('❌ MongoDB connection error:', error);
    });
    return connection;
  },
});