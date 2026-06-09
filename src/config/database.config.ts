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
    // Raise the listener limit — each forFeature() module adds listeners to the
    // underlying socket, so the default of 10 is exceeded with many models.
    connection.setMaxListeners(50);
    if (connection.client?.s?.options?.socketOptions) {
      // Also raise it on the raw Node.js net.Socket if accessible
      connection.client.s.options.socketOptions.maxListeners = 50;
    }

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