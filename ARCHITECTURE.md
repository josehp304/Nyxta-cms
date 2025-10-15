# 🏗️ Nyxta CMS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        NYXTA CMS                            │
│                     (Frontend Application)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Backend    │      │  ImageHippo  │     │   Browser    │
│     API      │      │     API      │     │  (Vite Dev)  │
│              │      │              │     │              │
│ Port: 3000   │      │  Image CDN   │     │ Port: 5173   │
└──────────────┘      └──────────────┘     └──────────────┘
```

## Component Architecture

```
App.tsx (React Router)
    │
    ├── Layout.tsx (Sidebar + Header)
    │       │
    │       ├── Dashboard.tsx
    │       │       └── Stats from all APIs
    │       │
    │       ├── BranchList.tsx
    │       │       ├── Fetches branches
    │       │       └── Links to BranchForm
    │       │
    │       ├── BranchForm.tsx
    │       │       ├── React Hook Form
    │       │       └── Create/Update branches
    │       │
    │       ├── GalleryList.tsx
    │       │       ├── Upload to ImageHippo
    │       │       ├── Save URL to backend
    │       │       └── Display images
    │       │
    │       └── EnquiriesList.tsx
    │               ├── Filter enquiries
    │               └── Update status
    │
    └── Shared Components
            ├── LoadingSpinner
            ├── ErrorMessage
            └── ConfirmDialog
```

## Data Flow

### 1. Branch Management Flow
```
User Action → BranchForm
              │
              ├── Collect form data
              ├── Validate with React Hook Form
              │
              ▼
         branchService.create(data)
              │
              ├── POST to Backend API
              │   /api/branches
              │
              ▼
         Backend saves to Postgres
              │
              ▼
         Return new branch data
              │
              ▼
         Update UI state
              │
              ▼
         Navigate to BranchList
```

### 2. Image Upload Flow
```
User selects image → GalleryList
                     │
                     ├── Open upload modal
                     ├── User fills form
                     │
                     ▼
                imageService.uploadImage(file)
                     │
                     ├── POST to ImageHippo API
                     │   /v1/upload
                     │
                     ▼
                ImageHippo returns URL
                     │
                     ▼
                galleryService.create({
                     image_url: url,
                     branch_id: x,
                     ...
                })
                     │
                     ├── POST to Backend API
                     │   /api/gallery
                     │
                     ▼
                Backend saves gallery record
                     │
                     ▼
                Update UI with new image
```

### 3. Enquiry Management Flow
```
User views enquiries → EnquiriesList
                       │
                       ├── enquiryService.getAll()
                       │
                       ▼
                  Display in grid
                       │
User clicks enquiry    │
                       ▼
              Show detail panel
                       │
User updates status    │
                       ▼
         enquiryService.update(id, { status })
                       │
                       ├── PUT to Backend API
                       │   /api/enquiries/:id
                       │
                       ▼
                Update UI state
```

## File Structure with Purpose

```
src/
├── components/
│   ├── branches/
│   │   ├── BranchList.tsx     → Display all branches
│   │   └── BranchForm.tsx     → Create/Edit form
│   ├── gallery/
│   │   └── GalleryList.tsx    → Image grid + upload
│   ├── enquiries/
│   │   └── EnquiriesList.tsx  → Enquiry management
│   ├── Dashboard.tsx          → Stats overview
│   ├── Layout.tsx             → Navigation shell
│   ├── LoadingSpinner.tsx     → Loading state
│   ├── ErrorMessage.tsx       → Error display
│   └── ConfirmDialog.tsx      → Confirmation modal
│
├── services/
│   └── api.ts                 → API client
│       ├── branchService      → Branch CRUD
│       ├── galleryService     → Gallery CRUD + upload
│       ├── enquiryService     → Enquiry CRUD
│       └── imageService       → ImageHippo integration
│
├── types/
│   └── index.ts               → TypeScript definitions
│       ├── Branch             → Branch type
│       ├── Gallery            → Gallery type
│       ├── UserEnquiry        → Enquiry type
│       └── ApiResponse<T>     → Generic response
│
├── App.tsx                    → React Router setup
├── main.tsx                   → Entry point
└── index.css                  → Tailwind directives
```

## API Service Layer

```typescript
// Centralized API communication

api.ts
  │
  ├── axios instance (Backend)
  │     baseURL: VITE_BACKEND_URL
  │     headers: Content-Type: application/json
  │
  ├── axios instance (ImageHippo)
  │     baseURL: https://api.imghippo.com/v1
  │     headers: Authorization: Bearer {API_KEY}
  │
  ├── branchService
  │     ├── getAll() → GET /api/branches
  │     ├── getById(id) → GET /api/branches/:id
  │     ├── create(data) → POST /api/branches
  │     ├── update(id, data) → PUT /api/branches/:id
  │     └── delete(id) → DELETE /api/branches/:id
  │
  ├── galleryService
  │     ├── getAll(branchId?) → GET /api/gallery
  │     ├── create(data) → POST /api/gallery
  │     ├── update(id, data) → PUT /api/gallery/:id
  │     ├── delete(id) → DELETE /api/gallery/:id
  │     └── uploadAndCreate() → ImageHippo + Backend
  │
  ├── enquiryService
  │     ├── getAll(branchId?) → GET /api/enquiries
  │     ├── update(id, data) → PUT /api/enquiries/:id
  │     └── delete(id) → DELETE /api/enquiries/:id
  │
  └── imageService
        ├── uploadImage(file) → POST /v1/upload
        └── deleteImage(url) → POST /v1/delete
```

## State Management

```
Component State (useState)
    │
    ├── Local UI state (loading, error, modals)
    ├── Fetched data (branches, galleries, enquiries)
    └── Form state (React Hook Form)
    
No global state management needed - 
data is fetched fresh on each page visit
```

## Routing Structure

```
/ (Root)
│
├── Layout (Sidebar + Content)
│   │
│   ├── / → Dashboard
│   │
│   ├── /branches → BranchList
│   │   ├── /branches/new → BranchForm (create)
│   │   └── /branches/:id/edit → BranchForm (edit)
│   │
│   ├── /gallery → GalleryList
│   │
│   └── /enquiries → EnquiriesList
```

## Technology Integration

```
┌─────────────────────────────────────────┐
│           React 18 + TypeScript          │
├─────────────────────────────────────────┤
│  React Router v6  │  React Hook Form    │
├───────────────────┼─────────────────────┤
│      Axios        │   Tailwind CSS      │
├───────────────────┼─────────────────────┤
│   Lucide Icons    │   Vite Dev Server   │
└─────────────────────────────────────────┘
```

## Environment Configuration

```
.env
  │
  ├── VITE_BACKEND_URL
  │     └── Used by: api.ts (axios baseURL)
  │
  └── VITE_IMGHIPPO_API
        └── Used by: api.ts (imageApi Authorization)
```

## Build & Deploy Flow

```
Development
    npm run dev
    ↓
    Vite starts at localhost:5173
    ↓
    Hot reload on file changes

Production
    npm run build
    ↓
    TypeScript compile + Vite bundle
    ↓
    Output: dist/ folder
    ↓
    npm run preview (test)
    ↓
    Deploy dist/ to hosting
```

## Key Design Decisions

1. **No State Management Library**
   - Simple app, fetch on page load
   - useState sufficient for local state

2. **Centralized API Layer**
   - All API calls in services/api.ts
   - Easy to modify/extend

3. **TypeScript Everywhere**
   - Type safety for API responses
   - Autocomplete in IDE

4. **Component Composition**
   - Reusable UI components
   - Feature-based organization

5. **Form Management**
   - React Hook Form for complex forms
   - Built-in validation

6. **Styling Approach**
   - Tailwind utility classes
   - No custom CSS needed

---

This architecture provides a solid foundation that's easy to understand, modify, and extend!
