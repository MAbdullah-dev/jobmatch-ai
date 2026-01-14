# JobMatch AI

A modern, AI-powered job matching web application built with Next.js and React. Upload your resume and discover job opportunities that match your skills and experience.

## 🚀 Features

- **AI-Powered Matching**: Upload your resume and get matched with relevant job opportunities
- **Drag & Drop Upload**: Easy resume upload with PDF/DOC/DOCX support
- **Smart Job Search**: Search and filter jobs by title, company, or location
- **Match Score Visualization**: See how well each job matches your profile with color-coded scores
- **AI Transparency**: Understand why jobs match with displayed skills
- **Multiple Job Sources**: Currently supports Google Jobs (LinkedIn, Indeed, Glassdoor coming soon)
- **Modern UI**: Clean, professional design inspired by Cursor, Linear, and Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **React**: 19.2
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── ResumeUpload.tsx
│   ├── JobCard.tsx
│   └── ...
└── data/            # Mock data
    └── mockJobs.ts
```

## 🎨 Features Overview

### Resume Upload
- Drag and drop file upload
- File validation (PDF, DOC, DOCX)
- Loading states and success/error feedback
- File removal capability

### Job Matching
- Match scores from 0-100%
- Color-coded indicators:
  - 🟢 Green: 80-100% (Excellent match)
  - 🟡 Yellow: 60-79% (Good match)
  - 🔴 Red: <60% (Fair match)
- "Why this match?" section showing matched skills

### Job Search & Filter
- Real-time search by job title, company, or location
- Filter by job source (Google Jobs active)
- Empty states and loading skeletons

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader friendly

## 📝 Documentation

For detailed documentation, see [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md)

## 🚧 Current Status

This is a **frontend-only** implementation with mock data. The application is production-ready and structured to easily integrate with:
- Backend API for job data
- AI service for resume analysis
- File storage for resumes
- Additional job source integrations

## 📄 License

All rights reserved.
