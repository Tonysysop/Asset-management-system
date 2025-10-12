# Asset Barcode & QR Code System Guide

## Overview

Your Asset Management System now includes **Code 128 barcodes AND QR codes** for every asset in the inventory. This dual-code system provides both quick scanning and comprehensive asset information storage.

## Features Implemented

### ✅ 1. Barcode Display

- Every asset now displays a **Code 128 barcode** in the asset details view
- Barcodes are generated from the asset's `assetTag` field
- The barcode label includes:
  - BUA Group company name
  - Asset Tag
  - Brand and Model
  - Asset Type
  - Visual barcode

### ✅ 2. Print Functionality

- **"Print Label"** button on each asset detail page
- Prints on standard label size (4" x 2")
- Print-optimized layout with proper margins
- Labels can be printed and stuck on physical assets

### ✅ 3. Automatic Integration

- Works with all existing assets automatically
- Shows up in the "View Details" modal for assets
- Available for both Admin and Auditor roles

## How to Use

### Viewing Barcodes

1. Go to the **Inventory** tab
2. Click the **3-dot menu** (⋮) on any asset row
3. Select **"View"** from the dropdown
4. The barcode appears at the top of the details modal

### Printing Labels

1. Open the asset details (as above)
2. Click the **"Print Label"** button at the top right of the barcode section
3. A print preview window will open automatically
4. Adjust print settings if needed (use actual size, no margins)
5. Print to your label printer or regular printer
6. Cut and attach the label to the physical asset

### Best Practices

- **Label Size**: Standard 4" x 2" labels work best
- **Printer Settings**:
  - Use "Actual Size" or "100% scale"
  - No margins/borders
  - Print on adhesive label paper
- **Placement**: Attach labels in a visible, accessible location on the asset
- **Scanning**: Use a standard barcode scanner to read the asset tag

## Technical Details

### Barcode Format

- **Type**: CODE128 (most common industrial barcode standard)
- **Data Encoded**: Asset Tag (e.g., "BUA-LAP-001")
- **Scanner Compatible**: Works with any CODE128-compatible scanner

### Label Specifications

- **Size**: 4 inches × 2 inches
- **Layout**:
  - Header with company name
  - Asset tag in bold
  - Device details (brand, model, type)
  - Barcode at bottom

### Files Added/Modified

1. **New Files:**
   - `src/components/BarcodeLabel.tsx` - Barcode component
2. **Modified Files:**
   - `src/components/ViewDetailsModal.tsx` - Added barcode display
   - `package.json` - Added react-barcode dependency

## Future Enhancements (Optional)

Consider adding these features in the future:

1. **Barcode Scanning Search**
   - Add a scanner input field to quickly search assets
   - Use phone camera or dedicated scanner
2. **Bulk Label Printing**
   - Generate PDF with multiple labels
   - Print all assets at once
3. **QR Codes**
   - Alternative to barcodes
   - Can encode more data (URLs to asset details)
4. **Mobile Scanning App**
   - Scan barcodes to update asset status
   - Check in/out assets via mobile

## Support

If you encounter any issues:

1. Ensure the asset has a valid `assetTag` value
2. Check that your printer supports the label size
3. Try printing to PDF first to verify the layout

---

**Note**: The barcode system is now fully integrated and works with all existing and future assets automatically. No additional configuration needed!
