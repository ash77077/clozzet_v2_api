# Toma Spreadsheet Import Guide

This guide explains how to import customer data and interaction history from the `Toma_optimized.xlsx` file.

## Prerequisites

1. Place the `Toma_optimized.xlsx` file in the **root directory** of the `clozzet_v2` project (one level above `clozzet-backend`).
2. Ensure your MongoDB database is running.
3. Make sure you're in the `clozzet-backend` directory.

## File Structure Expected

The Excel file should have a sheet named **"Toma"** with these columns:

- `Company Name` - Company name (required)
- `Industry` - Industry/sector
- `Contact Person` - Person's name (optional)
- `Position` - Job title (optional)
- `Phone` - Phone number (various formats supported)
- `Email` - Email address (optional)
- `Linkedin` - LinkedIn URL (optional)
- `Notes` - Interaction notes in Armenian/English
- `First Contact date` - Date of the interaction
- `Next Follow Up` - Next follow-up date (optional)
- `Scheduled meeting` - Meeting date (optional)

## Import Logic

The import script transforms the data as follows:

### 1. Grouping
Rows are grouped by `Company Name` + `Contact Person` to identify unique contacts/leads.

### 2. For Each Group
- **First row** (chronologically) becomes the **Customer record**:
  - Basic info (company, contact, phone, email, etc.)
  - First note goes into the `notes` field
  - Source is set to `"Toma spreadsheet import"`
  - `lastContactedAt` is set to the date of the LAST interaction
  - `nextFollowUpAt` is set from the LAST row's "Next Follow Up"
  - `scheduledMeetingAt` is set from the LAST row's "Scheduled meeting"

- **Subsequent rows** become **Interaction records**:
  - Linked to the customer via `customerId`
  - Interaction type determined from notes (defaults to "Call", detects "LinkedIn" mentions)
  - Each interaction preserves its date, notes, and follow-up info

### 3. Phone Normalization
- Strips `tel:` and `whatsapp:` prefixes
- Preserves the rest of the format as-is

### 4. Idempotency
The script checks for existing customers with:
- Same `companyName`
- Same `contactPerson`
- Same `source` = "Toma spreadsheet import"

If a match is found, the customer is skipped (prevents duplicates).

## How to Run

### Option 1: Dry Run (Recommended First)

Preview what will be imported **without writing to the database**:

```bash
npm run import-toma:dry-run
```

This will:
- Show how many customers would be created
- Show how many interactions would be created
- List each contact with their interaction count
- NOT modify the database

### Option 2: Actual Import

Once you've verified the dry run looks correct:

```bash
npm run import-toma
```

This will:
- Create customer records
- Create interaction history records
- Link interactions to customers
- Update follow-up dates and scheduled meetings

### Option 3: Custom File Path

If your Excel file is in a different location:

```bash
npm run import-toma /path/to/your/Toma_optimized.xlsx
```

Or for dry run:

```bash
npm run import-toma:dry-run /path/to/your/Toma_optimized.xlsx
```

## Expected Results

Based on the task description (380 rows, 220 unique companies):

- **~220 customer records** (some companies have multiple contacts)
- **~160 interaction records** (380 total rows - 220 first contacts)
- **~4 scheduled meetings** (only 4 rows have this field)

## Import Summary Output

After running, you'll see a summary like:

```
========================================
IMPORT SUMMARY
========================================
Total rows in Excel:        380
Unique contacts found:      220
Customers created:          220
Interactions created:       160
Scheduled meetings:         4
Errors:                     0
========================================
```

## Troubleshooting

### "File not found" error
- Make sure `Toma_optimized.xlsx` is in the root `clozzet_v2` directory
- Or provide the full path as an argument

### Validation errors
- Check that required fields (Company Name, Notes, First Contact date) are present
- Ensure date formats are recognized by Excel

### Duplicate entries
- If you run the import twice, existing customers will be skipped
- Check the console output for "Skipping duplicate" messages

### Database connection errors
- Ensure MongoDB is running
- Check your `.env` file for correct database credentials

## Schema Changes Made

The following fields were added to support the import:

### Customer Schema
- `source?: string` - Tracks where the customer data came from

This field is also added to the `CreateCustomerDto`.

## Next Steps After Import

1. Verify data in the CRM dashboard
2. Check that interaction history is properly linked to customers
3. Review follow-up dates and scheduled meetings
4. Update customer statuses as needed (all imports default to "Lead" status)

## Notes

- All Armenian text in notes is preserved as-is (UTF-8)
- Phone numbers maintain their original format after prefix stripping
- Interaction types are auto-detected (Call vs LinkedIn) based on note content
- If a contact person is null/empty, it's stored as "Unknown"
- The script is safe to run multiple times (idempotent)