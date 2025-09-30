import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@clozzet.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
    const adminPhone = process.env.ADMIN_PHONE || '+1234567890';

    try {
      // Check if admin user already exists
      const existingAdmin = await this.userModel.findOne({ 
        email: adminEmail.toLowerCase() 
      }).exec();

      if (existingAdmin) {
        this.logger.warn(`Admin user with email ${adminEmail} already exists`);
        throw new ConflictException(`Admin user with email ${adminEmail} already exists`);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create admin user
      const adminUser = new this.userModel({
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        phone: adminPhone,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true, // Admin should be pre-verified
      });

      await adminUser.save();

      this.logger.log(`✅ Admin user created successfully with email: ${adminEmail}`);
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`🔐 Password: ${adminPassword}`);
      this.logger.log(`👤 Name: ${adminFirstName} ${adminLastName}`);
      this.logger.log(`📱 Phone: ${adminPhone}`);
      this.logger.log(`🎭 Role: ${Role.ADMIN}`);
      
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('❌ Failed to create admin user:', error.message);
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
  }

  async updateAdminPassword(email: string, newPassword: string): Promise<void> {
    try {
      const adminUser = await this.userModel.findOne({ 
        email: email.toLowerCase(),
        role: Role.ADMIN 
      }).exec();

      if (!adminUser) {
        throw new Error(`Admin user with email ${email} not found`);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await this.userModel.updateOne(
        { _id: adminUser._id },
        { password: hashedPassword }
      ).exec();

      this.logger.log(`✅ Admin password updated successfully for email: ${email}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to update admin password:', error.message);
      throw new Error(`Failed to update admin password: ${error.message!}`);
    }
  }

  async deleteAdminUser(email: string): Promise<void> {
    try {
      const result = await this.userModel.deleteOne({ 
        email: email.toLowerCase(),
        role: Role.ADMIN 
      }).exec();

      if (result.deletedCount === 0) {
        throw new Error(`Admin user with email ${email} not found`);
      }

      this.logger.log(`✅ Admin user deleted successfully: ${email}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to delete admin user:', error.message);
      throw new Error(`Failed to delete admin user: ${error.message}`);
    }
  }

  async listAdminUsers(): Promise<User[]> {
    try {
      const adminUsers = await this.userModel.find({ 
        role: Role.ADMIN 
      }).select('-password').exec();

      this.logger.log(`📋 Found ${adminUsers.length} admin user(s)`);
      adminUsers.forEach(admin => {
        this.logger.log(`👤 ${admin.firstName} ${admin.lastName} (${admin.email}) - Active: ${admin.isActive}`);
      });

      return adminUsers;
      
    } catch (error) {
      this.logger.error('❌ Failed to list admin users:', error.message);
      throw new Error(`Failed to list admin users: ${error.message}`);
    }
  }
}
