# Quick Start: Customer Creator Migration

## 🚀 Run Migration on Production Server

### 1️⃣ Backup Database First! ⚠️
```bash
# This is CRITICAL - always backup before migrations
# If using MongoDB Atlas, create a snapshot in the UI
```

### 2️⃣ SSH into Production Server
```bash
ssh user@your-production-server.com
```

### 3️⃣ Navigate to Backend
```bash
cd /path/to/clozzet_v2/clozzet-backend
```

### 4️⃣ Run Migration
```bash
npm run migrate:assign-customers
```

### 5️⃣ Verify Success
Look for this message:
```
🎉 SUCCESS! All customers have been assigned to Toma Babayan.
```

## ✅ What Gets Updated

- All customers **without** a creator → Assigned to Toma Babayan
- Customers **already assigned** → Not touched (safe!)

## 📝 Files Changed

### Backend Schema
- `clozzet-backend/src/customers/schemas/customer.schema.ts`
  - Added `createdBy` field (ObjectId reference to User)

### Migration Script
- `clozzet-backend/src/scripts/assign-customers-to-toma.ts`
  - Complete migration logic with safety checks

### Package.json
- Added command: `npm run migrate:assign-customers`

## 🔍 Verify in Application

After migration:
1. Go to CRM Dashboard
2. Click "Toma Babayan" user filter
3. All legacy customers should appear
4. "Unassigned" filter should show 0

## 🆘 If Something Goes Wrong

**Restore from backup:**
```bash
# Contact your database admin or restore from MongoDB Atlas snapshot
```

## 📞 Need Help?

See full guide: `MIGRATION-GUIDE.md`
