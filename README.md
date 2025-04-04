# Notion to D3.js Converter

An interactive web application that visualizes Notion database hierarchies using D3.js. This tool creates dynamic, interactive circle visualizations directly from your Notion data, allowing you to explore and understand your organizational structure.

## Features

- Real-time visualization of Notion database hierarchies
- Interactive circle visualization with D3.js
- Search functionality for roles and people
- Responsive design with modern UI
- Optional environment configuration

## Required Notion Database Structure

### Circles Database
Required properties:
- `CircleName` (title): Name of the circle
- `CircleID` (number): Unique identifier for the circle
- `Purpose` (text, optional): The circle's purpose
- `Responsibilities` (text, optional): The circle's responsibilities
- `Projects` (text, optional): Related projects

### Roles Database
Required properties:
- `RoleName` (title): Name of the role
- `RoleID` (number): Unique identifier for the role
- `CircleID` (number): ID of the circle this role belongs to
- `Purpose` (text, optional): The role's purpose
- `Responsibilities` (text, optional): List of responsibilities
- `Pessoas alocadas` (relation): Relation to a People/Users database
- `Area` (text, optional): Area or department

## Setup

1. Clone the repository
```bash
git clone https://github.com/rodbastos/notion-d3.git
cd notion-d3
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env.local`
- Add your Notion API key

4. Run the development server
```bash
npm run dev
```

## Environment Variables

- `NOTION_KEY`: Your Notion API integration token (this is a server-side secret)
- `NEXT_PUBLIC_ROLES_DATABASE_ID` (optional): Default Roles database ID
- `NEXT_PUBLIC_CIRCLES_DATABASE_ID` (optional): Default Circles database ID

> **Security Note**: The `NOTION_KEY` is a server-side secret and should never be exposed to the client. It's used only in the API routes to make authenticated requests to Notion.

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the required environment variables
4. Deploy! 