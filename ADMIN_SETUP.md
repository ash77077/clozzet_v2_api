# Admin User Setup Guide

This guide explains how to create and manage admin users in the Clozzet backend application.

## Quick Start

### Creating an Admin User

The simplest way to create an admin user is using the provided npm script:

```bash
npm run create-admin
```

This will create an admin user with default credentials:
- **Email**: admin@clozzet.com
- **Password**: Admin@123456
- **Name**: Admin User
- **Phone**: +1234567890
- **Role**: admin

⚠️ **Important**: Please change the default password after first login for security reasons.

## Customizing Admin User Details

You can customize the admin user details by setting environment variables before running the command:

### Option 1: Using Environment Variables

Create a `.env` file (copy from `.env.example`) and set the following variables:

```bash
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
ADMIN_PHONE=+1987654321
```

Then run:
```bash
npm run create-admin
```

### Option 2: Inline Environment Variables

```bash
ADMIN_EMAIL=admin@yourcompany.com ADMIN_PASSWORD=SecurePass123! npm run create-admin
```

## Advanced Admin Management

The admin script supports multiple actions:

### List All Admin Users
```bash
npm run create-admin -- --action=list
```

### Update Admin Password
```bash
npm run create-admin -- --action=update-password --email=admin@clozzet.com --password=NewSecurePassword123!
```

### Delete Admin User
```bash
npm run create-admin -- --action=delete --email=admin@clozzet.com
```

## Security Features

### Password Security
- Passwords are hashed using bcryptjs with a salt factor of 12
- Minimum password length validation
- No plain text password storage

### Admin User Properties
- **Role**: Automatically set to `admin`
- **Email Verification**: Pre-verified (`isEmailVerified: true`)
- **Active Status**: Active by default (`isActive: true`)
- **Company**: Optional (admins don't need to belong to a company)

## Database Schema

Admin users are stored in the same `users` collection with the following structure:

```typescript
{
  email: string;           // Unique, lowercase
  password: string;        // Hashed with bcryptjs
  firstName: string;       // Admin's first name
  lastName: string;        // Admin's last name
  phone: string;          // Phone number
  role: 'admin';          // Always 'admin' for admin users
  company: ObjectId;     // Optional company reference
  isEmailVerified: true;  // Pre-verified for admins
  isActive: true;         // Active by default
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

## Error Handling

### Common Errors and Solutions

1. **"Admin user with email already exists"**
   - Solution: Use a different email or delete the existing admin first

2. **"MongoDB connection error"**
   - Solution: Ensure MongoDB is running and connection string is correct in `.env`

3. **"Module not found"**
   - Solution: Run `npm install` to ensure all dependencies are installed

4. **"Permission denied"**
   - Solution: Ensure the script has execute permissions and database is accessible

## Integration with Authentication System

The created admin user can immediately:
- Login using the `/auth/login` endpoint
- Access protected routes with `@Roles('admin')` decorator
- Perform admin-only operations
- Manage other users and system settings

## Example Usage

### Creating Multiple Admin Users

```bash
# Create first admin
ADMIN_EMAIL=admin1@company.com ADMIN_PASSWORD=SecurePass1! npm run create-admin

# Create second admin  
ADMIN_EMAIL=admin2@company.com ADMIN_PASSWORD=SecurePass2! npm run create-admin
```

### Production Deployment

For production deployments:

1. Set strong, unique passwords
2. Use company email addresses
3. Consider using secrets management
4. Document admin credentials securely

```bash
# Production example
ADMIN_EMAIL=admin@yourcompany.com \
ADMIN_PASSWORD=VerySecureProductionPassword123! \
ADMIN_FIRST_NAME=System \
ADMIN_LAST_NAME=Administrator \
ADMIN_PHONE=+1555123456 \
npm run create-admin
```

## Troubleshooting

### Script Fails to Run

1. **Check Node.js version**: Ensure you're using Node.js 16+
2. **Install dependencies**: Run `npm install`
3. **Check database connection**: Verify MongoDB is running
4. **Check environment variables**: Ensure `.env` file exists with correct values

### Script Runs but No User Created

1. **Check database connection string**: Verify `MONGODB_URI` in `.env`
2. **Check database permissions**: Ensure write access to the database
3. **Check for existing user**: The email might already be in use

### Need Help?

If you encounter issues:
1. Check the application logs
2. Verify your MongoDB connection
3. Ensure all environment variables are set correctly
4. Try running with `--action=list` to see existing admin users

## Files Modified/Created

This admin user functionality adds the following files to your project:

- `src/seeders/admin.seeder.ts` - Core admin user seeder service
- `src/seeders/seeders.module.ts` - NestJS module for seeders
- `src/scripts/create-admin.ts` - Standalone script for creating admin users
- `package.json` - Added `create-admin` npm script
- `.env.example` - Added admin user environment variables
- `src/app.module.ts` - Imported SeedersModule
