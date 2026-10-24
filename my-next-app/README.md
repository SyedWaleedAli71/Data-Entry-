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

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## DataFlow application

DataFlow is a shared MongoDB-backed data entry system with a user workspace and a server-verified administrator workspace.

### Main folders

- `app/`: App Router pages and Route Handlers. `(auth)` and `(dashboard)` are route groups; they do not appear in URLs. Admin pages are under `/WaleedAdmin`.
- `components/`: Shared forms, navigation, dashboard summaries, and tables.
- `lib/`: MongoDB connection, signed session handling, validation, and request helpers.
- `models/`: Mongoose User and Entry schemas. Both dashboards use the same Entry collection.
- `services/`: Shared database queries and dashboard summaries.
- `scripts/`: One-time administrator bootstrap command.

### Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI` to a local MongoDB or MongoDB Atlas connection string.
4. Replace `AUTH_SECRET` with a unique random value of at least 32 characters. For example, generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
5. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env.local` for the initial administrator. Use a unique password with at least 12 characters.
6. Run `npm run bootstrap:admin` once to create the initial admin. The script hashes the password and refuses to overwrite an existing account with that email.
7. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

Sign-in URLs: users at `/login`, administrators at `/WaleedAdmin`. Public registration always creates a `user` role. No public admin registration exists.

### Available commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run bootstrap:admin
```

The admin bootstrap reads variables from the process environment or `.env.local`. Keep `.env.local` private and out of source control.

### Security and data behavior

- Authentication uses a signed, HTTP-only, same-site cookie. The role and account status are looked up from MongoDB for protected requests; a client-provided role is never trusted.
- Passwords are hashed with bcryptjs. Password hashes are excluded from standard User queries and never sent to the browser.
- User entry queries and mutations include the authenticated owner ID. Admin entry routes require an active database-backed administrator.
- User-created and admin-created entries are stored in the same MongoDB collection and appear in the admin entry list.
- Admin account role/status changes run in a MongoDB transaction to protect the last active administrator. Use a replica-set MongoDB deployment (MongoDB Atlas supports this) for this feature.
- Login throttling is an in-memory, per-process limit; use a shared rate-limit store before deploying multiple server instances.
