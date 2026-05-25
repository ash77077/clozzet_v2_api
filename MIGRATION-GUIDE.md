# Customer Creator Migration Guide

## Overview

This guide explains how to migrate existing customer data to assign all unassigned customers to Toma Babayan.

## Background

Previously, the customer system did not track who created each customer. We've added a `createdBy` field to track the user who created each customer. This migration assigns all existing customers (without a creator) to Toma Babayan.

## Prerequisites

Before running this migration, ensure:

1. ✅ You have SSH/terminal access to the production server
2. ✅ You have the correct database connection configured
3. ✅ You have backed up the production database (IMPORTANT!)
4. ✅ Toma Babayan user exists in the database with:
   - `firstName`: "Toma"
   - `lastName`: "Babayan"

## Database Backup (REQUIRED)

**⚠️ CRITICAL: Always backup your database before running migrations!**

### MongoDB Atlas (Cloud)
```bash
# The database is automatically backed up by MongoDB Atlas
# You can create a manual snapshot in the Atlas UI before migration
```

### Self-Hosted MongoDB
```bash
# Create a backup
mongodump --uri="mongodb://localhost:27017/your-database-name" --out=/backup/$(date +%Y%m%d_%H%M%S)
```

## Running the Migration

### Step 1: Connect to Production Server

```bash
# SSH into your production server
ssh user@your-production-server.com
```

### Step 2: Navigate to Backend Directory

```bash
cd /path/to/clozzet_v2/clozzet-backend
```

### Step 3: Run the Migration

```bash
npm run migrate:assign-customers
```

## What the Migration Does

The migration script performs the following steps:

1. **Finds Toma Babayan User**
   - Searches for user with firstName="Toma" and lastName="Babayan"
   - Exits with error if user not found

2. **Counts Unassigned Customers**
   - Counts customers where `createdBy` is null or doesn't exist

3. **Previews Changes**
   - Shows the first 10 customers that will be updated
   - Displays total count of customers to be updated

4. **Performs Migration**
   - Updates all unassigned customers with Toma's user ID
   - Uses MongoDB's `updateMany` for efficiency

5. **Verifies Results**
   - Counts remaining unassigned customers
   - Counts customers assigned to Toma
   - Confirms success

## Expected Output

```
======================================================================
MIGRATION: Assign Customers to Toma Babayan
======================================================================

Step 1: Searching for Toma Babayan user...
✅ Found user: Toma Babayan
   - Email: toma@example.com
   - Role: admin
   - User ID: 507f1f77bcf86cd799439011

Step 2: Counting customers without creator...
📊 Found 150 customers without a creator

Step 3: Preview of customers to be updated...
First 10 customers:
   1. ABC Corp - John Doe
   2. XYZ Ltd - Jane Smith
   ... and 140 more

Step 4: Assigning customers to Toma Babayan...
⏳ Processing...

✅ Migration completed successfully!

======================================================================
MIGRATION SUMMARY
======================================================================
Total customers updated: 150
Assigned to: Toma Babayan (toma@example.com)
User ID: 507f1f77bcf86cd799439011
======================================================================

Step 5: Verifying migration...
✅ Customers still unassigned: 0
✅ Customers assigned to Toma: 150

🎉 SUCCESS! All customers have been assigned to Toma Babayan.
```

## Safety Features

The migration script includes several safety features:

- ✅ **Idempotent**: Can be run multiple times safely (won't re-assign already assigned customers)
- ✅ **User Verification**: Confirms Toma Babayan exists before making changes
- ✅ **Preview Mode**: Shows what will be changed before making changes
- ✅ **Detailed Logging**: Provides step-by-step progress information
- ✅ **Verification**: Confirms migration success after completion
- ✅ **Error Handling**: Gracefully handles errors with detailed messages

## Rollback (If Needed)

If you need to rollback the migration:

### Option 1: Restore from Backup
```bash
# Restore from your backup
mongorestore --uri="mongodb://localhost:27017/your-database-name" /backup/backup-folder
```

### Option 2: Manual Rollback
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/your-database-name"

# Remove createdBy from all customers assigned to Toma
db.customers.updateMany(
  { createdBy: ObjectId("TOMA_USER_ID_HERE") },
  { $unset: { createdBy: "" } }
)
```

## Troubleshooting

### Error: "Toma Babayan user not found"

**Solution**: Verify the user exists in the database:

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/your-database-name"

# Find Toma Babayan user
db.users.findOne({ firstName: "Toma", lastName: "Babayan" })
```

If the user doesn't exist, create it using the admin creation script or manually in the database.

### Error: "Connection refused" or "Cannot connect to database"

**Solution**:
- Check that MongoDB is running
- Verify connection string in `.env` file
- Ensure firewall allows connection

### Migration runs but no customers updated

**Solution**: This is normal if all customers already have a creator assigned. Check the output:
```
✅ No customers need assignment. Migration complete!
```

## Post-Migration Verification

After running the migration, verify in the application:

1. Go to CRM Dashboard
2. Check the user filter section
3. Click on "Toma Babayan" filter
4. Verify all legacy customers appear
5. "Unassigned" filter should show 0 customers

## Production Deployment Checklist

- [ ] Backup production database
- [ ] Verify Toma Babayan user exists
- [ ] Test migration on staging/development first
- [ ] Schedule maintenance window (if needed)
- [ ] Run migration on production
- [ ] Verify results in application
- [ ] Monitor for any issues
- [ ] Update team about completion

## Support

If you encounter any issues:

1. Check the error message in the console
2. Review the logs above
3. Verify database connection
4. Check that user exists
5. Contact development team

## Schema Changes

The migration adds the following field to the Customer schema:

```typescript
createdBy: ObjectId (reference to User)
```

This field:
- References the User collection
- Can be null (for backward compatibility)
- Is automatically set on new customer creation
- Can be populated to get full user details

## Notes

- The migration is **safe to run multiple times**
- Only customers **without** a `createdBy` field are updated
- Customers already assigned to a user are **not modified**
- The script provides **detailed logging** for audit purposes
