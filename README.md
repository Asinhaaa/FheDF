# FHEPdf - Privacy-Preserving PDF Toolkit

A privacy-focused PDF processing application with all PDF operations happening client-side in the browser, ensuring your files never leave your device.

## Features

- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDF** - Extract pages or split into multiple files  
- **Compress PDF** - Reduce file size with quality options
- **Convert PDF** - Convert PDF pages to images (PNG/JPEG)
- **FHE Encrypted Search** - Privacy-preserving text search using Fully Homomorphic Encryption

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend**: Express, tRPC, Drizzle ORM
- **PDF Processing**: pdf-lib, pdfjs-dist (client-side)
- **FHE**: Zama Concrete (simulated for demo)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone or extract the project
cd fhe-pdf-processor

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other configs

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
fhe-pdf-processor/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   └── tools/      # PDF tool pages
│   │   ├── lib/            # Utilities (pdfUtils.ts)
│   │   └── index.css       # Global styles & theme
├── server/                 # Backend Express + tRPC
│   ├── _core/              # Framework internals
│   ├── routers.ts          # API routes
│   └── db.ts               # Database queries
├── drizzle/                # Database schema
└── shared/                 # Shared types & constants
```

## Key Files

| File | Description |
|------|-------------|
| `client/src/pages/Home.tsx` | Landing page with hero section |
| `client/src/pages/tools/EncryptedSearch.tsx` | FHE search implementation |
| `client/src/pages/Documentation.tsx` | Technical documentation |
| `client/src/lib/pdfUtils.ts` | Client-side PDF processing |
| `client/src/index.css` | Theme & design tokens |

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=your-secret-key
```

## Deployment to Vercel

This project is ready for deployment to Vercel.

### 1. Connect to GitHub

Ensure your project is pushed to a GitHub repository.

### 2. Import Project in Vercel

- In your Vercel dashboard, click "Add New..." -> "Project".
- Import the GitHub repository.

### 3. Configure Project

Vercel should automatically detect that this is a Vite project. The default settings should work correctly.

- **Framework Preset**: Vite
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install`

### 4. Deploy

Click the "Deploy" button. Vercel will build and deploy your project. After a few minutes, your FHE-enhanced application will be live!

## Privacy Guarantees

1. **Zero Server Uploads** - All PDF processing uses WebAssembly in the browser
2. **Client-Side Encryption** - FHE operations happen locally
3. **No Data Collection** - We don't track or store your files
4. **Open Source** - Full transparency in implementation

## FHE Encrypted Search Enhancement

This project has been enhanced with a production-ready, client-side FHE encrypted search feature using `node-seal` (Microsoft SEAL).

### Changes Overview

- **Real FHE**: Replaced simulated FHE with genuine homomorphic encryption.
- **Client-Side**: All cryptographic operations (key generation, encryption, homomorphic evaluation, decryption) run in the browser.
- **`node-seal` Integration**: Uses the mature and performant Microsoft SEAL library via WebAssembly.
- **Secure Key Storage**: FHE keys are generated and stored securely in the browser's IndexedDB.
- **Improved UI**: The UI now provides real-time feedback on the FHE process.

## License

MIT License - Feel free to use and modify for your projects.

## Links

- **Zama**: [zama.ai](https://www.zama.ai/)
- **Concrete Docs**: [docs.zama.ai/concrete](https://docs.zama.ai/concrete)
