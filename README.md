# Daily Drilling Report (DDR) Application

A comprehensive web application for managing daily drilling reports in the oil and gas industry. Built with React, Supabase, and modern web technologies.

## Features

### For Company Men
- Create and submit daily drilling reports
- Enter comprehensive drilling data including:
  - General well and rig information
  - Bit records and performance data
  - Rate of Penetration (ROP) data
  - Mud properties and chemistry
  - Directional drilling surveys
  - BHA (Bottom Hole Assembly) configurations
  - Casing and cementing operations
  - Formation tops and lithology

### For Engineers
- View all drilling reports
- Filter reports by well name and date range
- Export reports to PDF format
- Export reports to Excel format
- Access detailed drilling data across all wells

### Authentication & Security
- Secure user authentication
- Role-based access control (Companyman, Engineer, Admin)
- Row-level security in database
- Protected routes and API endpoints

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v6
- **Styling**: Custom CSS with modern design
- **PDF Export**: jsPDF with autotable
- **Excel Export**: xlsx (SheetJS)

## Project Structure

```
ddr-app/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Auth.css
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   └── reports/           # Report components
│   │       ├── ReportForm.jsx
│   │       ├── ReportForm.css
│   │       ├── ReportView.jsx
│   │       ├── ReportView.css
│   │       └── forms/         # Individual form sections
│   │           ├── GeneralDataForm.jsx
│   │           ├── BitDataForm.jsx
│   │           ├── RopDataForm.jsx
│   │           ├── MudDataForm.jsx
│   │           ├── DirectionalDataForm.jsx
│   │           ├── BHADataForm.jsx
│   │           ├── CasingDataForm.jsx
│   │           └── FormationTopsForm.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── lib/
│   │   └── supabase.js        # Supabase client config
│   ├── utils/
│   │   ├── pdfExport.js       # PDF export functionality
│   │   └── excelExport.js     # Excel export functionality
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── supabase-schema.sql        # Database schema
├── .env.example               # Environment variables template
├── SUPABASE_LOCAL.md          # Local development guide
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker Desktop (for local Supabase)
- Supabase CLI (optional, for local development)

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd ddr-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:

   **Option A: Use Hosted Supabase**
   - Follow the instructions in `../SUPABASE_SETUP.md`
   - Create a `.env` file with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

   **Option B: Run Supabase Locally**
   - Follow the instructions in `SUPABASE_LOCAL.md`
   - This is recommended for development

4. **Apply the database schema**:
   - Copy the contents of `supabase-schema.sql`
   - Run it in Supabase SQL Editor (Studio) or via CLI

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   - Navigate to http://localhost:5173
   - Sign up for an account or log in

## Usage

### Creating a Daily Report

1. Log in as a Companyman
2. Click "New Report" from the dashboard
3. Fill in the tabs:
   - **General Data**: Well info, depths, time breakdown, operations summary
   - **Bit Data**: Bit records with IADC grading
   - **ROP Data**: Rate of penetration with drilling parameters
   - **Mud Data**: Mud properties, rheology, chemistry
   - **Directional**: Survey points with inclination and azimuth
   - **BHA & Tools**: Bottom hole assembly configuration
   - **Casing**: Casing strings and cement jobs
   - **Formations**: Formation tops and lithology
4. Click "Submit Report"

### Viewing and Exporting Reports

1. Log in as Engineer or Companyman
2. View reports on the dashboard
3. Use filters to find specific reports
4. Click "View" to see full details
5. Click "PDF" or "Excel" to export

### User Roles

- **Companyman**: Can create, edit, and view their own reports
- **Engineer**: Can view and export all reports (read-only)
- **Admin**: Full access to all features

## Database Schema

The application uses a comprehensive schema with the following main tables:

- `profiles` - User profiles with roles
- `daily_reports` - Main report data
- `bit_records` - Bit performance records
- `rop_records` - Rate of penetration data
- `mud_records` - Mud properties
- `directional_records` - Directional surveys
- `bha_records` - BHA configurations
- `casing_records` - Casing and cement data
- `formation_tops` - Formation tops
- `report_comments` - Comments on reports

All tables include Row Level Security (RLS) policies for data protection.

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the documentation in this README
- Review SUPABASE_SETUP.md for setup help
- Review SUPABASE_LOCAL.md for local development
- Check Supabase documentation at https://supabase.com/docs

## Acknowledgments

- Built with Supabase for backend infrastructure
- Designed for the oil and gas drilling industry
- Inspired by standard daily drilling report formats
