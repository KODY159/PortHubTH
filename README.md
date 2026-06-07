# PortBaseTH

![image alt](https://github.com/KODY159/PortHubTH/blob/98841e91947a86cba8a9b3473d8f09f82b63154f/Web-screenshot.png)

PortBaseTH is a platform for showcasing portfolios, projects, and achievements. It is designed to help students, developers, designers, and creators build an online presence and share their work in one place.

## Features

* Portfolio profiles
* Project showcase
* Questions & Answers section
* Portfolio bookmarking
* Search and discovery
* Responsive design for desktop and mobile

## Tech Stack

### Frontend

* Next.js
* TypeScript
* React

### Backend & Database

* Supabase

### Deployment

* Vercel

### Monitoring

* Sentry

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd portbaseth
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and add the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Project Structure

```txt
src/
├── app/
├── components/
├── lib/
├── hooks/
├── services/
└── types/

public/
```

## Roadmap

* Improved portfolio discovery
* Enhanced search experience
* Portfolio analytics
* Community features
* Additional profile customization

## License

This project is currently under active development.
