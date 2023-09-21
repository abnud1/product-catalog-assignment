This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Environment Setup

To run this project you need to have these requirements:

- MongoDB 7.0.1
- Node.js 20.6.1
- npm 10.1.0

For MongoDB, please change `MONGODB_URI` environment variable to a working
MongoDB database version 7.0.1.

## Getting Started

First, run `npm i`, then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The products list will probably show `No Product` because the database is empty.

To fix that please run:

```bash
npm run db:seed
```

before running the app, it should populate products database with dummy data.

## Running tests

```bash
npm test
```
