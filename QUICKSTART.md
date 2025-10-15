# Quick Start Guide - Nyxta CMS

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites Check

```bash
node --version  # Should be 16+
npm --version   # Should be 8+
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy and update `.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_IMGHIPPO_API=659ce04175409ae9df2ab375d4cfeb93
```

### 4. Start Backend (if not running)

In backend directory:
```bash
npm run dev
```

Backend should be running at `http://localhost:3000`

### 5. Start Frontend

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📍 First Steps

1. **Dashboard** - View overview statistics
2. **Add Branch** - Click "Branches" → "Add Branch"
3. **Upload Images** - Click "Gallery" → "Upload Image"
4. **Check Enquiries** - Click "Enquiries" to see user submissions

## 🎯 Common Tasks

### Add a New Branch

1. Navigate to Branches
2. Click "Add Branch"
3. Fill in required fields:
   - Branch Name (required)
   - Address (required)
   - Contact Numbers (at least one)
   - Room Rates (at least one)
   - Registration Fee (required)
4. Add optional details (amenities, location, etc.)
5. Click "Create Branch"

### Upload Images

1. Navigate to Gallery
2. Click "Upload Image"
3. Select Branch
4. Choose image file
5. Add title and tags (optional)
6. Click "Upload"

### Manage Enquiries

1. Navigate to Enquiries
2. Filter by branch or status
3. Click on an enquiry to view details
4. Update status as needed

## 🔧 Troubleshooting

### Can't connect to backend?
- Check if backend is running: `http://localhost:3000`
- Verify `VITE_BACKEND_URL` in `.env`

### Image upload fails?
- Check `VITE_IMGHIPPO_API` key in `.env`
- Verify image format and size

### Build errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read full documentation in `FRONTEND_README.md`
- Check backend API documentation
- Customize colors and branding

---

Need help? Check the full README or backend documentation.
