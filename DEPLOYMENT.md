# Deployment Guide

## Quick Deploy to Vercel

### 1. Prepare for Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

### 2. Deploy

1. **Deploy the app**:
   ```bash
   vercel
   ```

2. **Follow the prompts**:
   - Project name: `ar-model-system` (or your preferred name)
   - Framework: Next.js (should auto-detect)
   - Build command: `npm run build` (default)
   - Output directory: `.next` (default)

### 3. Set Environment Variables

After deployment, set these environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Go to Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

### 4. Test Your Deployment

1. **Upload a model** at `https://your-app-name.vercel.app/upload`
2. **Download the QR code**
3. **Scan the QR code** with your phone
4. **Point your camera at a Hiro marker** to see the AR model

## AR Setup Instructions

### For Users Scanning QR Codes:

1. **Scan the QR code** with your phone camera
2. **Allow camera permissions** when prompted
3. **Download and print the Hiro marker**:
   - Go to: https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png
   - Print it on paper (black and white is fine)
4. **Point your phone camera at the printed marker**
5. **The 3D model will appear on the marker!**

### Marker Requirements:
- Print the Hiro marker on white paper
- Ensure good lighting
- Keep the marker flat and visible
- The model will appear floating above the marker

## Features

### ✅ What Works:
- **Upload GLB files** → Automatic QR code generation
- **Scan QR codes** → Opens AR viewer on mobile
- **Camera AR** → 3D models overlay on real world
- **Marker-based AR** → Models appear on Hiro marker
- **Fallback 3D viewer** → Works on all devices

### 📱 Mobile Experience:
- **Camera access** for AR
- **Touch controls** for 3D viewer fallback
- **Share functionality** built-in
- **Responsive design** for all screen sizes

## Troubleshooting

### AR Not Working?
1. **Check camera permissions** - Allow camera access
2. **Use HTTPS** - AR requires secure connection (Vercel provides this)
3. **Print the marker** - Download and print the Hiro marker
4. **Good lighting** - Ensure the marker is well-lit
5. **Fallback to 3D** - Use the "3D View" button if AR fails

### QR Code Not Working?
1. **Check the URL** - Make sure NEXT_PUBLIC_BASE_URL is set correctly
2. **Test locally** - Try the link manually first
3. **Camera permissions** - Some QR scanners need camera access

### Models Not Loading?
1. **Check file format** - Only GLB files are supported
2. **File size** - Keep models under 10MB for best performance
3. **Network** - Ensure good internet connection

## Production Considerations

### Performance:
- **Optimize GLB files** before uploading
- **Use CDN** for faster model loading (Vercel provides this)
- **Compress textures** in your 3D models

### Security:
- **File validation** - Only allow GLB uploads
- **Size limits** - Implement file size restrictions
- **Rate limiting** - Prevent abuse of upload endpoint

### Scaling:
- **Database** - Consider upgrading from JSON file storage
- **Storage** - Use cloud storage for production (S3, etc.)
- **CDN** - Optimize for global delivery

## Next Steps

1. **Deploy to Vercel** using the steps above
2. **Test AR functionality** on mobile devices
3. **Share QR codes** and test with others
4. **Optimize models** for better performance
5. **Add more features** as needed

Your AR system is now ready for production! 🚀
