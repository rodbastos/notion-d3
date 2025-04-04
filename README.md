# Notion to D3.js Converter

This application allows you to convert data from Notion databases into CSV format that can be used with D3.js visualizations.

## Features

- Connect to Notion API using your API key
- Fetch data from Roles and Circles databases
- Convert the data into CSV format
- Save credentials in localStorage for convenience
- Modern UI with responsive design

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- A Notion API key
- Notion database IDs for Roles and Circles

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notion-to-d3-converter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is configured to be deployed on Vercel. To deploy:

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Follow the deployment steps

The application will be automatically deployed and you'll get a URL where it's hosted.

## Usage

1. Enter your Notion API key
2. Enter the database IDs for both Roles and Circles databases
3. Click "Buscar Dados do Notion" to fetch the data
4. Copy the generated CSV data and save it to files
5. Use the CSV files with your D3.js visualization

## Environment Variables

No environment variables are required for this application as it uses client-side storage for the API key and database IDs.

## License

This project is licensed under the MIT License. 