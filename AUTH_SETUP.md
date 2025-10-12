# Authentication Setup Guide

## Overview
The authentication system has been upgraded from a simple client-side password check to use Supabase Auth for proper security and session management.

## What Changed

### Before
- Hardcoded password (`Raffa's@Admin!2025`) in the client code
- Authentication state stored in `localStorage`
- No backend validation
- Easily bypassable

### After
- Supabase Auth integration
- Proper email/password authentication
- Server-side session validation
- Protected routes with role-based access
- Secure logout functionality

## Setup Instructions

### 1. Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable email authentication
4. Copy your project URL and anon key

### 2. Environment Variables
Create a `.env` file in the project root with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Admin User
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" and create an admin user with email `admin@Raffa's.com`
3. Set a secure password
4. Optionally, add custom metadata: `{"role": "admin"}`

### 4. Database Policies (Optional)
If you want to add additional security, you can create RLS policies for admin-only access to sensitive tables.

## New Features

### Authentication Context
- `useAuth()` hook provides authentication state and methods
- Automatic session management
- Real-time auth state updates

### Protected Routes
- `/admin` now requires authentication
- `/admin/login` for the login form
- Automatic redirects for unauthenticated users

### Admin Dashboard
- Shows logged-in user's email
- Secure logout functionality
- No more hardcoded password

## Security Improvements

1. **Server-side validation**: Authentication is validated by Supabase
2. **Session management**: Proper session handling with automatic refresh
3. **Role-based access**: Easy to extend with different user roles
4. **Secure logout**: Properly clears server-side sessions
5. **No client-side secrets**: No hardcoded passwords in the code

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `/admin` - should redirect to `/admin/login`
3. Login with your admin credentials
4. Should be redirected to the admin dashboard
5. Test logout functionality

## Troubleshooting

- Make sure your Supabase environment variables are correctly set
- Verify the admin user exists in your Supabase project
- Check the browser console for any authentication errors
- Ensure your Supabase project has email authentication enabled
