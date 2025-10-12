# Cloudinary Receipt Upload Setup Guide

## Overview
This implementation allows customers to upload payment receipt images during checkout. Images are stored in Cloudinary (free tier) and receipt URLs are saved to your Supabase database.

## ✅ What Was Implemented

### 1. **New Files Created**
- `src/lib/cloudinary.ts` - Upload utility functions with image compression
- `supabase/migrations/20250108000000_add_receipt_url.sql` - Database migration
- `CLOUDINARY_SETUP.md` - This setup guide

### 2. **Modified Files**
- `src/components/Checkout.tsx` - Added receipt upload UI
- `src/components/OrdersManager.tsx` - Added receipt image display
- `src/hooks/useOrders.ts` - Added receipt_url handling
- `src/types/index.ts` - Added receipt_url to types

### 3. **Features**
- ✅ Drag & drop file upload
- ✅ Image preview before upload
- ✅ Automatic image compression (saves bandwidth)
- ✅ 10MB file size limit
- ✅ Support for JPG, PNG, WEBP, HEIC formats
- ✅ Upload progress indicator
- ✅ Error handling with user-friendly messages
- ✅ Admin can view receipts in order details

---

## 🚀 Setup Instructions

### Step 1: Create Cloudinary Upload Preset

1. Go to your Cloudinary Dashboard: https://console.cloudinary.com/
2. Navigate to **Settings** → **Upload**
3. Scroll to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `Raffa's_receipts`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `receipts` (optional but recommended)
   - **Upload Manipulations** → **Quality**: 80 (for optimization)
   - **Access Mode**: Public
6. Click **Save**

### Step 2: Set Environment Variables

Create a `.env` file in your project root:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dgo9es1ew
VITE_CLOUDINARY_UPLOAD_PRESET=Raffas_receipts
```

**Note**: Your cloud name `dgo9es1ew` is extracted from your CLOUDINARY_URL.

### Step 3: Run Database Migration

Run the migration to add the `receipt_url` column to your orders table:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly in Supabase Dashboard SQL Editor
# Copy contents of: supabase/migrations/20250108000000_add_receipt_url.sql
```

### Step 4: Restart Development Server

```bash
npm run dev
```

---

## 📦 Free Tier Limits

**Cloudinary Free Tier Includes:**
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Image transformations
- ✅ No credit card required

**Estimated capacity**: ~125,000-250,000 receipt images (assuming 100-200KB each after compression)

---

## 🧪 Testing the Feature

### For Customers:
1. Add items to cart
2. Proceed to checkout
3. Fill in order details
4. Go to payment step
5. Click the upload area or drag an image
6. Preview appears with "Upload Receipt" button
7. Click "Upload Receipt"
8. Wait for success message
9. Place order

### For Admins:
1. Go to Admin Dashboard → Orders
2. Click "View" on any order with a receipt
3. Receipt image appears in the modal
4. Click image to view full size

---

## 🔐 Security Notes

1. **Unsigned Uploads**: We use unsigned uploads for simplicity. This is secure because:
   - Upload preset controls what can be uploaded
   - No API credentials exposed in frontend
   - Cloudinary validates all uploads

2. **File Validation**: The app validates:
   - File type (images only)
   - File size (max 10MB)
   - Image format before upload

3. **Image Compression**: All images are compressed before upload to:
   - Reduce storage costs
   - Speed up uploads
   - Save bandwidth

---

## 🐛 Troubleshooting

### "Cloudinary configuration missing" Error
- Make sure `.env` file exists in project root
- Verify environment variables start with `VITE_`
- Restart dev server after creating .env

### Upload Fails with "Invalid upload preset"
- Check that upload preset name matches exactly: `Raffa's_receipts`
- Verify preset is set to "Unsigned" mode
- Check cloud name is correct

### Image Not Displaying in Admin
- Verify order has `receipt_url` in database
- Check browser console for CORS errors
- Ensure Cloudinary URLs are accessible

### Rate Limiting Issues
- Cloudinary free tier limits: 500 uploads/hour
- For high volume, consider upgrading plan

---

## 💡 Optional Enhancements

### 1. Auto-Upload on Selection
Change to auto-upload when file is selected (skip manual upload button):

```typescript
// In Checkout.tsx, modify handleReceiptFileChange
const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setReceiptFile(file);
  // ... preview code ...
  
  // Auto-upload
  await handleUploadReceipt();
};
```

### 2. Multiple Receipt Support
Allow customers to upload multiple receipt images for split payments.

### 3. Image Cropping
Add image cropping tool before upload for better framing.

### 4. OCR Integration
Use Cloudinary's AI to extract payment details from receipts automatically.

---

## 📊 Monitoring Usage

Check your Cloudinary usage:
1. Dashboard → Account → Usage
2. Monitor: Storage, Bandwidth, Transformations
3. Set up alerts at 80% usage

---

## 🆘 Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Cloudinary Support**: https://support.cloudinary.com/
- **Issues**: Check browser console for detailed error messages

---

## ✨ What's Next?

The receipt upload feature is now fully integrated! Customers can:
- Upload receipts during checkout
- Skip upload and attach in Messenger (optional)

Admins can:
- View receipts in order details
- Click to view full-size images
- Verify payments easily

Everything is set up to use Cloudinary's free tier, saving you money on database storage costs! 🎉

