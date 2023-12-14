This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installation

You need to install python libraries to artifacts directory.

```bash
$ cp -rfp lambda/classifyInquiryWithBedrock lambda/artifacts
$ cd lambda/artifacts
$ pip install -r requirements.txt -t .
```

## Getting Started

First, run the sandbox environment on Amplify Gen2

```bash
$ npm ci
$ npx amplify sandbox
```

And, run the development server:

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
