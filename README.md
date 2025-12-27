# FHEPdf - Privacy-Preserving PDF Toolkit

A privacy-focused PDF processing application built for the **Zama FHE Developer Grant**. All PDF operations happen client-side in the browser, ensuring your files never leave your device.

**Built by [@ramx_ai](https://x.com/ramx_ai)**

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
| `client/src/pages/Documentation.tsx` | Technical docs for grant |
| `client/src/lib/pdfUtils.ts` | Client-side PDF processing |
| `client/src/index.css` | Theme & design tokens |

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=your-secret-key
```

## Deployment

### Vercel (Frontend Only)

For a static frontend deployment:

```bash
cd client
pnpm build
# Deploy the dist folder to Vercel
```

### Full Stack

For full stack with database:
- Use Railway, Render, or similar platforms
- Set environment variables for database connection
- Run `pnpm db:push` after deployment

## Privacy Guarantees

1. **Zero Server Uploads** - All PDF processing uses WebAssembly in the browser
2. **Client-Side Encryption** - FHE operations happen locally
3. **No Data Collection** - We don't track or store your files
4. **Open Source** - Full transparency in implementation

## Zama FHE Integration

The FHE Encrypted Search feature demonstrates:
- Encrypting search queries before processing
- Computing on encrypted data (ciphertext)
- Decrypting results client-side

For production FHE, integrate [Zama Concrete](https://docs.zama.ai/concrete) compiled to WebAssembly.

## License

MIT License - Feel free to use and modify for your projects.

## Links

- **Twitter**: [@ramx_ai](https://x.com/ramx_ai)
- **Zama**: [zama.ai](https://www.zama.ai/)
- **Concrete Docs**: [docs.zama.ai/concrete](https://docs.zama.ai/concrete)
