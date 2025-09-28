# TenTwenty Frontend - React Timesheet Management

This is the frontend application for the TenTwenty timesheet management system, built with React and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Frameworks & Libraries Used

### Core Technologies
- **React 19.1.1** - JavaScript library for building user interfaces
- **React Router DOM 6.8.0** - Client-side routing and navigation
- **Axios 1.6.0** - HTTP client for API communication

### UI & Styling
- **React Icons 5.5.0** - Comprehensive icon library
- **CSS3** - Custom styling with modern CSS features

### Development Tools
- **Create React App 5.0.1** - React application boilerplate
- **React Scripts** - Build and development tools
- **Web Vitals 2.1.4** - Performance monitoring

### Testing
- **@testing-library/react 16.3.0** - React component testing utilities
- **@testing-library/jest-dom 6.8.0** - Custom Jest matchers
- **@testing-library/user-event 13.5.0** - User interaction simulation

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── favicon.ico        # Site icon
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.js   # Main dashboard component
│   │   ├── Login.js       # Authentication component
│   │   ├── TimeSheetTable.jsx    # Timesheet display
│   │   ├── TimeSheetAction.jsx   # Timesheet actions
│   │   └── Pagination.jsx        # Data pagination
│   ├── services/          # API service layer
│   │   └── api.js         # HTTP client configuration
│   ├── styles/            # CSS stylesheets
│   │   ├── Dashboard.css  # Dashboard styling
│   │   ├── Login.css      # Login page styling
│   │   ├── TimesheetTable.css    # Table styling
│   │   └── Pagination.css        # Pagination styling
│   ├── App.js             # Main application component
│   ├── App.css            # Global styles
│   └── index.js           # Application entry point
└── package.json           # Dependencies and scripts
```

## 🎯 Features

### Authentication
- **Login System** - Secure user authentication
- **JWT Token Management** - Automatic token handling
- **Role-based Access** - Different views for employees and managers
- **Session Persistence** - Remember login state

### Timesheet Management
- **Create Timesheets** - Add new time entries
- **Edit Timesheets** - Modify existing entries
- **View Timesheets** - Display all timesheet data
- **Delete Timesheets** - Remove unwanted entries
- **Pagination** - Efficient data navigation

### User Interface
- **Responsive Design** - Works on all device sizes
- **Modern UI** - Clean and intuitive interface
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error management

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
The page will reload when you make changes and show lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.
See the [running tests](https://facebook.github.io/create-react-app/docs/running-tests) documentation for more information.

### `npm run build`
Builds the app for production to the `build` folder.
The build is optimized for the best performance with minified files and hashed filenames.

### `npm run eject`
**Note: This is a one-way operation. Once you eject, you can't go back!**

Ejects from Create React App and gives you full control over the build configuration.

## 🔗 API Integration

The frontend communicates with the backend API through the following endpoints:

- **Authentication**: `POST /api/auth/login`
- **Timesheets**: `GET /api/timesheets`
- **Create Timesheet**: `POST /api/timesheets`
- **Update Timesheet**: `PUT /api/timesheets/:id`
- **Delete Timesheet**: `DELETE /api/timesheets/:id`

## 🚨 Assumptions & Notes

1. **Backend Dependency**: Requires the backend server to be running on port 5000
2. **Authentication**: Uses JWT tokens stored in localStorage
3. **Data Format**: Expects specific JSON structure from API responses
4. **Browser Support**: Modern browsers with ES6+ support
5. **CORS**: Backend must have CORS enabled for localhost:3000
6. **Error Handling**: Basic error handling with user-friendly messages
7. **State Management**: Uses React hooks for local state management

## ⏱️ Development Time

### Frontend Development (8-12 hours total)
- **Project Setup & Configuration**: 1-2 hours
- **Component Development**: 4-6 hours
  - Login component with validation
  - Dashboard with navigation
  - Timesheet table with pagination
  - Timesheet action forms (create/edit)
- **Styling & UI/UX**: 2-3 hours
  - Responsive design implementation
  - Custom CSS styling
  - Loading states and animations
- **API Integration**: 2-3 hours
  - Axios configuration
  - Error handling
  - State management
- **Testing & Debugging**: 1-2 hours
  - Component testing
  - Cross-browser testing
  - Bug fixes and optimization

### Backend Development (6-8 hours total)
- **Project Setup & Configuration**: 1 hour
- **API Development**: 3-4 hours
  - Authentication endpoints
  - CRUD operations for timesheets
  - Data validation
- **Database Integration**: 1-2 hours
  - JSON file structure
  - Data persistence
- **Testing & Debugging**: 1-2 hours
  - API testing
  - Error handling
  - Security implementation

### Total Project Timeline: 14-20 hours

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deployment

- **Render** - Connect your GitHub repository and deploy with automatic builds


## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔧 Environment Variables

Create a `.env` file in the frontend directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=TenTwenty
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

For the complete project documentation, see the main [README.md](../README.md)