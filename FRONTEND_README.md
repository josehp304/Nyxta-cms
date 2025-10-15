# Nyxta CMS Frontend

A modern, full-featured Content Management System for managing Nyxta hostels. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Branch Management**: Full CRUD operations for hostel branches
  - Add/Edit/Delete branches
  - Manage room rates, amenities, and contact information
  - Location tracking with latitude/longitude
  
- **Gallery Management**: Image management with ImageHippo integration
  - Upload images directly to ImageHippo
  - Organize images by branch
  - Tag and order images
  - Image preview and delete functionality
  
- **Enquiry Management**: Track and manage user enquiries
  - View all enquiries with filtering options
  - Filter by branch and status
  - Update enquiry status (Pending, Contacted, Converted, Closed)
  - Detailed enquiry view with contact information
  
- **Dashboard**: Overview of system statistics
  - Total branches, images, and enquiries
  - Quick action buttons
  - System status indicators

## 📋 Prerequisites

- Node.js 16+ and npm
- Backend API running (see backend documentation)
- ImageHippo API key

## 🛠️ Installation

1. **Clone or navigate to the project directory**

```bash
cd cms-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create or update `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_IMGHIPPO_API=your_imghippo_api_key
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
cms-frontend/
├── src/
│   ├── components/
│   │   ├── branches/
│   │   │   ├── BranchList.tsx       # List all branches
│   │   │   └── BranchForm.tsx       # Create/Edit branch form
│   │   ├── gallery/
│   │   │   └── GalleryList.tsx      # Gallery with upload
│   │   ├── enquiries/
│   │   │   └── EnquiriesList.tsx    # Enquiries management
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Layout.tsx               # App layout with sidebar
│   │   ├── LoadingSpinner.tsx       # Loading component
│   │   ├── ErrorMessage.tsx         # Error display
│   │   └── ConfirmDialog.tsx        # Confirmation modal
│   ├── services/
│   │   └── api.ts                   # API service layer
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── App.tsx                      # Main app with routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── .env                             # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🔌 API Integration

The frontend communicates with the Nyxta backend API. All API calls are centralized in `src/services/api.ts`.

### Services Available

- **branchService**: Branch CRUD operations
- **galleryService**: Gallery CRUD + ImageHippo upload
- **enquiryService**: Enquiry management
- **imageService**: ImageHippo upload/delete

### Example Usage

```typescript
import { branchService } from './services/api';

// Get all branches
const branches = await branchService.getAll();

// Create new branch
const newBranch = await branchService.create({
  name: 'Nyxta Central',
  address: '123 Main St',
  contact_no: ['+91-9876543210'],
  room_rate: [{ title: 'Single', rate_per_month: 8000 }],
  reg_fee: 2000,
  is_mess_available: true,
});
```

## 📸 ImageHippo Integration

The CMS integrates with ImageHippo for image storage:

1. Images are uploaded to ImageHippo via their API
2. The returned URL is stored in the database
3. Images can be deleted from both the database and ImageHippo

## 🎯 Key Features Explained

### Branch Management

- **List View**: Grid layout showing all branches with key information
- **Create/Edit**: Comprehensive form with:
  - Multiple contact numbers
  - Multiple room rates
  - Amenities list
  - Location coordinates
  - Mess availability
  
### Gallery Management

- **Upload Modal**: Simple interface to upload images
- **Filter by Branch**: View images for specific branches
- **Tags**: Organize images with custom tags
- **Display Order**: Control image order

### Enquiry Management

- **Two-Panel Layout**: List view and detail view
- **Status Management**: Update enquiry status
- **Filtering**: Filter by branch and status
- **Contact Integration**: Click-to-call and email links

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_IMGHIPPO_API` | ImageHippo API key | `your_api_key_here` |

## 🐛 Troubleshooting

### Backend Connection Issues

- Ensure backend is running on the correct port
- Check `VITE_BACKEND_URL` in `.env`
- Verify CORS is enabled on backend

### ImageHippo Upload Errors

- Verify `VITE_IMGHIPPO_API` key is correct
- Check image file size (ImageHippo has limits)
- Ensure valid image format (jpg, png, gif)

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Colors

Update Tailwind colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Layout

Modify sidebar and navigation in `src/components/Layout.tsx`

## 📄 License

ISC

## 🤝 Support

For issues or questions:
- Check backend documentation
- Verify environment variables
- Ensure all dependencies are installed

---

**Made for Nyxta Hostels** 🏨
