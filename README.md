# AI Course Syllabus Generator

A production-ready Next.js application that generates AI-driven course syllabi based on user input. Built with TypeScript, Prisma, Google Gemini, and ShadCN UI components.

## 📖 What is This?

The **AI Course Syllabus Generator** is an intelligent web application that leverages Google's Gemini AI to automatically create comprehensive, structured course syllabi. Simply provide a topic and difficulty level, and the AI generates a complete course outline with multiple modules, descriptions, and learning paths.

### Key Features

-   **🤖 AI-Powered Generation**: Uses Google Gemini AI to create detailed course syllabi tailored to your topic and difficulty level
-   **📚 Structured Learning Paths**: Automatically generates 6-8 progressive modules that build upon each other
-   **🎯 Difficulty-Based Content**: Creates content appropriate for beginner, intermediate, or advanced learners
-   **💾 Persistent Storage**: Saves all generated courses to a PostgreSQL database for future reference
-   **✏️ Full CRUD Operations**: Create, view, edit, and delete courses and their modules
-   **🎨 Modern UI**: Beautiful, responsive interface built with ShadCN components and Tailwind CSS

## 🎯 Use Cases

This application is perfect for:

### Educational Institutions

-   **Teachers & Instructors**: Quickly generate course outlines for new subjects or curriculum planning
-   **Curriculum Designers**: Create structured learning paths for educational programs
-   **Academic Administrators**: Plan semester courses and track course structures

### Online Learning Platforms

-   **Course Creators**: Generate initial course structures before developing detailed content
-   **E-Learning Companies**: Rapidly prototype course outlines for new subjects
-   **Training Organizations**: Create structured training programs for corporate or professional development

### Personal Learning

-   **Self-Learners**: Generate personalized learning paths for topics you want to master
-   **Study Planners**: Create structured study plans with progressive modules
-   **Skill Development**: Plan your learning journey for new skills or technologies

### Development & Prototyping

-   **Startups**: Quickly prototype course offerings for MVP development
-   **Content Teams**: Generate initial course structures for content planning
-   **Product Managers**: Create course outlines for product documentation or training materials

## 💡 How It Works

1. **Input**: Enter a course topic (e.g., "React Development", "Machine Learning", "Web Design") and select a difficulty level
2. **AI Processing**: The application sends your request to Google Gemini AI, which analyzes the topic and generates a structured syllabus
3. **Structured Output**: The AI returns a complete course with:
    - Course title and description
    - 6-8 progressive modules
    - Module descriptions and learning objectives
    - Estimated duration for each module
4. **Storage**: The generated course is saved to your database for future reference and editing
5. **Management**: View, edit, or delete courses through an intuitive interface

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns, making it maintainable, testable, and scalable:

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

## 🚀 Quick Start Guide

### Basic Usage

1. **Generate a Course**:

    - Navigate to the "Generate" tab
    - Enter a course topic (e.g., "React Development", "Machine Learning", "Web Design")
    - Select a difficulty level (Beginner, Intermediate, Advanced)
    - Click "✨ Generate Syllabus"
    - Wait for the AI to create your course (usually takes 5-10 seconds)

2. **View Your Courses**:

    - Switch to the "My Courses" tab
    - Browse all your generated courses in a beautiful grid layout
    - See course details, module counts, and creation dates

3. **Edit Courses**:

    - Click on any course card in "My Courses"
    - Edit course title, topic, description, and difficulty
    - Edit individual modules (title, description, duration)
    - Save your changes

4. **Delete Courses**:
    - Click the 🗑️ icon on any course card
    - Confirm deletion to remove the course permanently

### Example Topics

Try generating courses for:

-   **Technology**: "React Development", "Python Programming", "Docker & Kubernetes"
-   **Business**: "Digital Marketing", "Project Management", "Data Analysis"
-   **Design**: "UI/UX Design", "Graphic Design Fundamentals", "Web Design"
-   **Science**: "Machine Learning", "Data Science", "Quantum Computing"
-   **Languages**: "Spanish for Beginners", "Business English", "French Conversation"

## 🏛️ Code Standards

-   **No `any` types**: All code is strictly typed
-   **Zod validation**: All inputs validated at runtime
-   **JSDoc comments**: Complex logic documented
-   **Clean Architecture**: Separation of concerns (actions → services → lib)
-   **Error handling**: Comprehensive error handling throughout

## 🔍 Technical Highlights

### Why This Stack?

-   **Next.js 14**: Modern React framework with Server Actions for seamless API integration
-   **TypeScript**: Full type safety with zero `any` types for production-ready code
-   **Prisma**: Type-safe database access with automatic migrations
-   **Google Gemini AI**: Powerful AI model for intelligent content generation
-   **Zod**: Runtime validation ensuring data integrity
-   **ShadCN UI**: Beautiful, accessible component library
-   **Tailwind CSS**: Utility-first CSS for rapid, responsive design

### Code Quality Standards

-   ✅ **No `any` types**: Strict TypeScript throughout
-   ✅ **Zod validation**: All inputs validated at runtime
-   ✅ **JSDoc comments**: Complex logic fully documented
-   ✅ **Clean Architecture**: Clear separation of concerns
-   ✅ **Error handling**: Comprehensive error handling and user feedback
-   ✅ **Type safety**: End-to-end type safety from database to UI

## 📝 License

This project is created for demonstration purposes and interview showcases.

## 🤝 Contributing

This is a skeleton repository for interview purposes. Feel free to use it as a reference for your own projects or as a learning resource.

## 🙏 Acknowledgments

-   Built with [Next.js](https://nextjs.org/)
-   AI powered by [Google Gemini](https://ai.google.dev/)
-   UI components from [ShadCN](https://ui.shadcn.com/)
-   Database managed with [Prisma](https://www.prisma.io/)
