# Church Admin CMS (Standalone)

This is a standalone, lightweight version of the Church Application's Admin Portal. It serves as a dedicated CMS (Content Management System) that can be hosted independently.

## Features
- Full access to the Admin Dashboard.
- Management of Officials, Records, and Donations.
- Devotions & AI content management.
- Gallery and Media management.
- User suggestions and notification system.

## Setup Instructions

### 1. Installation
Navigate to this directory and install dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the `admin-cms` directory (or set these in your hosting provider like Vercel/Netlify):

```env
# The URL of your hosted backend API (e.g., https://your-backend.herokuapp.com/api/v1)
VITE_SERVER_URI=http://localhost:3001/api/v1
```

### 3. Backend Update (IMPORTANT)
For the Admin CMS to communicate with your backend, you must update the backend's `CORS_ORIGIN` setting.
- In your backend `.env` file, add the URL where this Admin CMS is hosted:
```env
CORS_ORIGIN=http://localhost:5173,https://your-admin-cms-link.vercel.app
```

### 4. Running Locally
```bash
npm run dev
```

### 5. Hosting (Vercel/Netlify)
- Link this sub-directory (`admin-cms`) to your hosting platform.
- Ensure the `Build Command` is `npm run build`.
- Ensure the `Output Directory` is `dist`.
- Provide the `VITE_SERVER_URI` environment variable.

## Benefits of Standalone Hosting
- **Security**: You can keep the main website public while hosting the Admin CMS on a private or restricted domain.
- **Performance**: Smaller bundle size and faster load times for admin tasks.
- **Independence**: Update and deploy the admin portal without affecting the main public website.
