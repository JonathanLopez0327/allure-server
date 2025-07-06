# Allure Server

A web server for managing and viewing Allure reports centrally. This application allows you to upload Allure reports in ZIP format and view them through a modern web interface.

## 🚀 Features

- **Report Upload**: Web interface for uploading Allure reports in ZIP format
- **Visualization**: Complete Allure report visualization in the browser
- **Centralized Management**: List of all uploaded reports with easy navigation
- **Modern Interface**: UI built with React and Material-UI
- **RESTful API**: Express.js backend for file and report handling

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd allure-server
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

## 🚀 Running

### Development

1. **Start the server** (from the `server` folder):
```bash
npm run dev
```
The server will run on `http://localhost:4000`

2. **Start the client** (from the `client` folder):
```bash
npm run dev
```
The client will run on `http://localhost:5173`

### Production

1. **Build the client**:
```bash
cd client
npm run build
```

2. **Build the server**:
```bash
cd server
npm run build
```

3. **Run in production**:
```bash
cd server
npm start
```

## 📁 Project Structure

```
allure-server/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Main page with report list
│   │   │   └── ReportViewer.tsx   # Report viewer
│   │   └── App.tsx                # Main component
│   └── package.json
├── server/                 # Express Backend
│   ├── indexV2.ts         # Main server
│   └── package.json
└── reports/               # Directory where reports are stored
```

## 🔧 Configuration

### Environment Variables

The server uses the following environment variables:

- `PORT`: Server port (default: 4000)
- `REPORT_ROOT`: Directory where reports are stored (default: `./reports`)

### Client Configuration

The client is configured to connect to the server at `http://localhost:4000`. If you need to change this URL, modify the API calls in the components.

## 📖 Usage

### 1. Access the application

Open your browser and go to `http://localhost:5173`

### 2. Upload a report

1. On the main page, click "Select file"
2. Select a ZIP file containing an Allure report
3. Click "Upload"
4. The report will be processed and appear in the list

### 3. View a report

1. In the report list, click on the report you want to view
2. The Allure report will open in full screen
3. Use the "Back" button to return to the list

## 🔌 API Endpoints

### GET `/api/runs`
Gets the list of all available reports.

**Response:**
```json
["01_12_24-1430", "30_11_24-1020"]
```

### POST `/api/runs`
Uploads a new Allure report.

**Parameters:**
- `report`: ZIP file containing the Allure report

**Response:**
```json
{
  "success": true,
  "id": "01_12_24-1430",
  "message": "Report uploaded successfully in folder: 01_12_24-1430",
  "index": "/reports/01_12_24-1430/allure-report/index.html"
}
```

### GET `/api/runs/:id`
Gets detailed information about a specific report.

**Response:**
```json
{
  "id": "01_12_24-1430",
  "index": "/reports/01_12_24-1430/allure-report/index.html"
}
```

## 🛠️ Technologies Used

### Frontend
- **React 19**: UI framework
- **TypeScript**: Static typing
- **Material-UI**: UI components
- **React Router**: Navigation
- **Vite**: Build tool and dev server

### Backend
- **Express.js**: Web framework
- **TypeScript**: Static typing
- **Multer**: File handling
- **extract-zip**: ZIP file extraction
- **CORS**: CORS support

## 📝 Development Notes

### Report Structure

Reports are stored in the `reports/` directory with the following structure:

```
reports/
├── DD_MM_YY-HHMM/
│   └── allure-report/
│       ├── index.html
│       ├── data/
│       └── widgets/
```

### Folder Naming

Report folders are automatically named with the format:
`DD_MM_YY-HHMM` (example: `01_12_24-1430`)

### Report Validation

The server validates that ZIP files contain:
- An `allure-report` folder or
- Typical Allure files (`index.html`, `data/`, `widgets/`)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the ISC License. See the `LICENSE` file for more details.

## 👨‍💻 Author

**Jonathan López**

## 🐛 Known Issues

- Reports must be in ZIP format
- Maximum file size is 100MB
- Only ZIP files are supported

## 🔮 Roadmap

- [ ] Support for multiple report formats
- [ ] User authentication
- [ ] Automatic compression of old reports
- [ ] API to delete reports
- [ ] Dashboard with statistics 