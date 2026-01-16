# AI Course Syllabus Generator

A production-ready Next.js application that generates AI-driven course syllabi based on user input. Built with TypeScript, Prisma, Google Gemini, and ShadCN UI components.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions (API layer)
│   ├── page.tsx           # Main UI component
│   └── layout.tsx         # Root layout
├── components/            # React UI components
│   └── ui/               # ShadCN-style reusable components
├── lib/                   # Shared utilities
│   ├── prisma.ts         # Prisma client singleton
│   ├── ai-client.ts      # Google Gemini client
│   └── utils.ts          # Utility functions
├── services/              # Business logic layer
│   ├── ai-service.ts     # AI generation logic
│   └── course-service.ts # Database operations
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types and Zod schemas
└── prisma/                # Database schema
    └── schema.prisma     # Prisma schema definition
```

## 🚀 Features

-   **Type-Safe**: Strict TypeScript with no `any` types
-   **Input Validation**: Zod schemas for runtime validation
-   **AI-Powered**: Google Gemini integration for intelligent course generation
-   **Database**: PostgreSQL with Prisma ORM
-   **Modern UI**: ShadCN-style components with Tailwind CSS
-   **Clean Code**: JSDoc comments and clean architecture principles

## 📋 Prerequisites

-   Node.js 18+ and npm/yarn/pnpm
-   PostgreSQL database (local or cloud)
-   Google Gemini API key

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/course_generator?schema=public"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Database Setup

Generate Prisma Client:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Or run migrations (recommended for production):

```bash
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Database Schema

### Models

-   **User**: Stores user information
-   **Course**: Stores course metadata (title, topic, difficulty)
-   **SyllabusModule**: Stores individual modules within a course

### Relationships

-   User has many Courses (one-to-many)
-   Course has many SyllabusModules (one-to-many)

## 🔧 Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run start` - Start production server
-   `npm run lint` - Run ESLint
-   `npm run db:generate` - Generate Prisma Client
-   `npm run db:push` - Push schema changes to database
-   `npm run db:migrate` - Run database migrations
-   `npm run db:studio` - Open Prisma Studio (database GUI)

## 🎯 Usage

1. Enter a course topic (e.g., "React Development", "Machine Learning")
2. Select a difficulty level (Beginner, Intermediate, Advanced)
3. Click "Generate Syllabus"
4. View the AI-generated course with modules

## 🏛️ Code Standards

-   **No `any` types**: All code is strictly typed
-   **Zod validation**: All inputs validated at runtime
-   **JSDoc comments**: Complex logic documented
-   **Clean Architecture**: Separation of concerns (actions → services → lib)
-   **Error handling**: Comprehensive error handling throughout

## 📝 License

This project is created for demonstration purposes.

## 🤝 Contributing

This is a skeleton repository for interview purposes. Feel free to use it as a reference for your own projects.
