# AR Model System

A complete system for uploading GLB 3D models, generating QR codes, and viewing models anywhere. Perfect for AR applications where you want to print QR codes and have them link to 3D model viewers.

## Features

- ✅ **GLB File Upload**: Upload 3D models in GLB format
- ✅ **Automatic QR Code Generation**: Each uploaded model gets a unique QR code
- ✅ **3D Model Viewer**: Interactive 3D viewer with orbit controls
- ✅ **Model Management**: List, view, and manage all uploaded models
- ✅ **Cloud Storage**: Files stored in Supabase Storage
- ✅ **Database**: Model metadata stored in PostgreSQL via Prisma

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **3D Rendering**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Supabase Storage
- **QR Codes**: qrcode library

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_BASE_URL`: Your app URL (for QR code generation)

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Supabase Storage Setup
Create two storage buckets in your Supabase project:
- `models` (for GLB files)
- `qr-codes` (for QR code images)

Make both buckets public for read access.

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to start using the system.

## Usage Workflow

### 1. Upload a Model
1. Go to `/upload` or click "Upload Model" on the homepage
2. Fill in model name and optional description
3. Select a GLB file
4. Click "Upload Model"
5. System automatically generates a QR code

### 2. View Models
1. Go to `/models` or click "View Models" on the homepage
2. See all uploaded models with their QR codes
3. Click "View 3D Model" to see the interactive viewer
4. Download QR codes for printing

### 3. Share via QR Code
1. Print the QR code anywhere (business cards, posters, etc.)
2. Anyone can scan the QR code with their phone
3. QR code opens the 3D model viewer in their browser
4. They can interact with the 3D model using touch/mouse controls

## API Endpoints

- `POST /api/upload-model` - Upload GLB file and generate QR code
- `GET /api/models` - List all models
- `GET /api/models/[id]` - Get specific model by ID

## File Structure

```
ar-system/
├── pages/
│   ├── api/
│   │   ├── models/
│   │   │   ├── index.ts      # List models
│   │   │   └── [id].ts       # Get model by ID
│   │   └── upload-model.ts   # Upload endpoint
│   ├── view/
│   │   └── [id].tsx          # 3D model viewer
│   ├── models.tsx            # Models listing page
│   └── upload.tsx            # Upload page
├── src/app/
│   └── page.tsx              # Homepage
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── supabaseClient.ts     # Supabase client
├── prisma/
│   └── schema.prisma         # Database schema
└── uploads/                  # Temporary upload directory
```

## Database Schema

```prisma
model Model3D {
  id          String   @id @default(cuid())
  name        String
  description String?
  fileUrl     String   // Supabase Storage URL for GLB file
  qrCodeUrl   String?  // Supabase Storage URL for QR code image
  createdAt   DateTime @default(now())
}
```

## 3D Viewer Controls

- **Rotate**: Left click + drag
- **Pan**: Right click + drag
- **Zoom**: Mouse wheel or pinch on mobile

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Set up production database (PostgreSQL)
3. Configure Supabase project for production
4. Update `NEXT_PUBLIC_BASE_URL` to your production domain
5. Run database migrations: `npx prisma db push`

## Troubleshooting

### QR Codes Not Working
- Check that `NEXT_PUBLIC_BASE_URL` is set correctly
- Ensure Supabase `qr-codes` bucket is public
- Verify QR code images are being uploaded to Supabase

### 3D Models Not Loading
- Ensure GLB files are valid
- Check that Supabase `models` bucket is public
- Verify file URLs are accessible

### Upload Failures
- Check file size limits (default: 50MB)
- Ensure Supabase storage has sufficient space
- Verify database connection

## License

MIT License - feel free to use this for your projects!
