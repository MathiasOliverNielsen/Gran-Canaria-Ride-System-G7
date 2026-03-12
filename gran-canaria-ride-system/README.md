This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


## Android Health Connect Integration

This project now supports step-progress syncing for the rewards page through Android Health Connect.

### What was added

- Step sync API endpoints:
	- `GET /api/steps/today`
	- `POST /api/steps/sync`
- Daily step persistence model in Prisma (`StepDaily`)
- Rewards progress UI now updates from synced step totals
- Error handling for permission denial, unsupported devices, and API failures

### Android setup expectation

The web app expects an Android bridge injected into `window.HealthConnectBridge` with this interface:

- `isAvailable(): boolean | Promise<boolean>` (optional)
- `requestPermissions(): boolean | Promise<boolean>` (optional)
- `getTodaySteps(): number | Promise<number>` (required)

The Android host app should:

1. Install and configure Health Connect permissions for reading steps.
2. Implement the bridge methods above.
3. Open this web app in a WebView or wrapper that exposes the bridge.

Without the bridge, the UI will show a supported error message and stop polling.
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
