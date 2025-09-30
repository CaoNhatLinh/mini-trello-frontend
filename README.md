# 🎨 Mini Trello Frontend

Frontend React application cho ứng dụng Mini Trello được xây dựng với React 19, Vite và Material-UI.

## 🏗️ Kiến trúc Frontend

### Tech Stack
- **React 19** với **Vite** build tool
- **Material-UI (MUI)** cho UI components
- **React Router Dom** cho navigation
- **Socket.IO Client** cho real-time communication
- **Zustand** cho state management
- **React DnD** cho drag & drop functionality
- **Axios** cho API calls
- **Date-fns** cho date formatting

### Cấu trúc thư mục
```
src/
├── App.jsx                   # Main App component với routing
├── main.jsx                  # Entry point
├── assets/                   # Static assets (images, icons)
├── components/               # Reusable components
│   ├── auth/                    # Authentication components
│   │   ├── Login.jsx               # Login form với email verification
│   │   ├── GitHubCallback.jsx      # GitHub OAuth callback handler
│   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   ├── boards/                  # Board management components
│   │   ├── BoardColumns.jsx        # Kanban board layout
│   │   ├── BoardHeader.jsx         # Board title và member management
│   │   ├── BoardSettings.jsx       # Board settings dialog
│   │   ├── DeleteBoardDialog.jsx   # Delete confirmation dialog
│   │   ├── EditBoardDialog.jsx     # Edit board dialog
│   │   ├── InvitationList.jsx      # Board invitations list
│   │   ├── InviteMember.jsx        # Invite member dialog
│   │   ├── ListDialog.jsx          # Create/edit column dialog
│   │   └── PendingInvitations.jsx  # User's pending invitations
│   ├── layout/                  # Layout components
│   │   ├── Layout.jsx              # Main layout wrapper
│   │   └── Navbar.jsx              # Navigation bar
│   ├── notifications/           # Notification system
│   │   ├── NotificationIcon.jsx    # Bell icon với badge
│   │   ├── NotificationList.jsx    # Dropdown notification list
│   │   └── NotificationManager.jsx # Notification state management
│   ├── tasks/                   # Task management components
│   │   ├── CardColumn.jsx          # Individual column component
│   │   ├── TaskCard.jsx            # Task card component
│   │   ├── TaskDetailDialog.jsx    # Task detail modal
│   │   ├── TaskMemberAssignment.jsx # Member assignment component
│   │   ├── GitHubIntegration.jsx   # GitHub attachment UI
│   │   ├── GitHubAttachmentDialog.jsx
│   │   ├── GitHubAttachmentIndicator.jsx
│   │   ├── GitHubAttachmentList.jsx
│   │   └── GitHubAttachmentSummary.jsx
│   └── users/                   # User-related components
├── contexts/                 # React contexts
│   └── AuthContext.jsx         # Authentication context
├── hooks/                    # Custom hooks
│   ├── useGitHubAttachments.js # GitHub attachments hook
│   └── useRealTimeUpdates.js   # Socket.IO real-time updates
├── pages/                    # Page components
│   ├── Dashboard.jsx           # Main dashboard với board list
│   └── BoardView.jsx           # Board detail với Kanban view
├── services/                 # API và external services
│   ├── api.js                  # Axios API client
│   └── socketService.js        # Socket.IO client
├── theme/                    # UI theming
│   ├── colors.css              # CSS color variables
│   └── theme.js                # MUI theme configuration
└── utils/                    # Utility functions
    ├── index.js                # General utilities
    └── store.js                # Zustand store definitions
```

## 🌟 Chức năng chính

### 🔐 Authentication & User Management
- **Email Verification Login**: Đăng nhập bằng email với mã xác thực
- **GitHub OAuth Integration**: Liên kết tài khoản GitHub
- **User Profile Management**: Cập nhật thông tin cá nhân
- **Protected Routes**: Route protection cho authenticated users

**📸 CHỤP ẢNH SCREENS:**
- [ ] Login page với email input và verification code form
- [ ] User profile dialog với GitHub connection status
- [ ] GitHub OAuth callback success/error states

### 📋 Dashboard & Board Management
- **Board Creation**: Tạo board mới với tên và mô tả
- **Board List View**: Hiển thị tất cả boards của user
- **Board Access Control**: Owner và member permissions
- **Board Settings**: Edit, delete, leave board options

**📸 CHỤP ẢNH SCREENS:**
- [ ] Dashboard với board grid layout
- [ ] Create board dialog
- [ ] Board settings dialog
- [ ] Empty state khi chưa có boards

### 🎯 Kanban Board Interface
- **Column Management**: Tạo, sửa, xóa columns (To Do, In Progress, Done)
- **Drag & Drop**: Kéo thả tasks giữa các columns
- **Real-time Updates**: Socket.IO updates khi có thay đổi
- **Board Header**: Title, member list, actions

**📸 CHỤP ẢNH SCREENS:**
- [ ] Full Kanban board view với 3 columns
- [ ] Drag & drop task animation
- [ ] Board header với member avatars
- [ ] Add new column dialog

### ✅ Task Management
- **Task CRUD**: Tạo, đọc, cập nhật, xóa tasks
- **Task Details**: Title, description, priority, due date
- **Member Assignment**: Gán tasks cho board members
- **Task Status**: Todo, In Progress, Done states
- **Quick Add Task**: Nhanh chóng thêm task vào column

**📸 CHỤP ẢNH SCREENS:**
- [ ] Task detail dialog đầy đủ thông tin
- [ ] Task card trong column
- [ ] Member assignment dropdown
- [ ] Quick add task input
- [ ] Task priority và due date indicators

### 👥 Member & Invitation Management
- **Invite Members**: Gửi lời mời qua email
- **Pending Invitations**: Xem và quản lý lời mời đã gửi
- **Accept/Decline**: Phản hồi lời mời tham gia board
- **Member List**: Hiển thị tất cả members của board
- **Remove Members**: Owner có thể remove members

**📸 CHỤP ẢNH SCREENS:**
- [ ] Invite member dialog với email input
- [ ] Pending invitations list
- [ ] Board member list với roles
- [ ] Invitation notification trong notification center

### 🔗 GitHub Integration
- **Repository Access**: Xem danh sách repositories
- **Issue Attachment**: Đính kèm GitHub issues vào tasks
- **Pull Request Attachment**: Đính kèm PRs vào tasks
- **Commit Tracking**: Link commits với tasks
- **GitHub Status**: Hiển thị connection status

**📸 CHỤP ẢNH SCREENS:**
- [ ] GitHub repository selection dialog
- [ ] GitHub issues list với search
- [ ] Task với GitHub attachments
- [ ] GitHub attachment indicators trên task cards
- [ ] GitHub connection status trong profile

### 🔔 Real-time Notifications
- **Notification Bell**: Icon với unread count badge
- **Notification Dropdown**: List notifications với actions
- **Real-time Updates**: Socket.IO powered notifications
- **Board Invitations**: Notification cho lời mời board
- **Task Updates**: Notification khi tasks được update

**📸 CHỤP ẢNH SCREENS:**
- [ ] Notification bell icon với badge
- [ ] Notification dropdown list
- [ ] Board invitation notification
- [ ] Task update notification
- [ ] Mark all as read functionality

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-friendly interface
- **Material-UI Theme**: Consistent Google Material Design
- **Loading States**: Skeleton screens và spinners
- **Error Handling**: User-friendly error messages
- **Dark/Light Mode**: Theme switching (nếu implement)

**📸 CHỤP ẢNH SCREENS:**
- [ ] Mobile responsive board view
- [ ] Loading states cho various components
- [ ] Error messages và empty states
- [ ] Consistent Material-UI styling

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001

# Feature Flags (optional)
VITE_ENABLE_GITHUB_INTEGRATION=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_DEBUG_MODE=false
```

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

## 🏪 State Management (Zustand)

### Store Structure
```javascript
// Authentication Store
useAuthStore: {
  user,
  isAuthenticated,
  login,
  logout,
  updateProfile
}

// Board Store
useBoardStore: {
  boards,
  currentBoard,
  loading,
  error,
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard
}

// Card Store (Columns)
useCardStore: {
  cards,
  loading,
  error,
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
  updateCardPosition
}

// Task Store
useTaskStore: {
  tasks,
  loading,
  error,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksForCard
}
```

## 🔌 Real-time Updates (Socket.IO)

### Socket Events Handling
```javascript
// Board Events
socket.on('board_created', handleBoardCreated);
socket.on('board_updated', handleBoardUpdated);
socket.on('member_joined', handleMemberJoined);

// Task Events
socket.on('task_created', handleTaskCreated);
socket.on('task_updated', handleTaskUpdated);
socket.on('task_moved', handleTaskMoved);

// GitHub Events
socket.on('github_attachment_added', handleGitHubAttachmentAdded);

// Notification Events
socket.on('new_notification', handleNewNotification);
```

## 📱 Component Architecture

### Key Components

#### TaskCard Component
```jsx
// TaskCard hiển thị task trong column với:
// - Title và description
// - Assigned members (avatars)
// - Due date indicator
// - Priority color coding
// - GitHub attachment indicator
// - Drag & drop support
```

#### BoardColumns Component  
```jsx
// BoardColumns render Kanban layout với:
// - Drag & drop zones
// - Column headers với actions
// - Task lists với virtual scrolling
// - Add task buttons
// - Real-time updates
```

#### GitHubIntegration Component
```jsx
// GitHub integration UI bao gồm:
// - Repository selection
// - Issue/PR browsing
// - Attachment management
// - Connection status
// - Search functionality
```

## 🚀 Build & Deployment

### Production Build
```bash
npm run build
# Output: dist/ directory
```

### Deployment Options
1. **Vercel**: Zero-config deployment
2. **Netlify**: Static site hosting
3. **AWS S3 + CloudFront**: Scalable solution
4. **Docker**: Containerized deployment

## 🐛 Debugging & Troubleshooting

### Common Issues
1. **Socket.IO Connection**: Check CORS và network settings
2. **State Updates**: Verify Zustand store mutations
3. **Drag & Drop**: HTML5 backend compatibility
4. **GitHub OAuth**: Callback URL configuration
5. **Real-time Updates**: Socket event handling

### Debug Tools
- **React Developer Tools**: Component inspection
- **Zustand DevTools**: State debugging
- **Network Tab**: API call monitoring
- **Socket.IO Debug**: Real-time event logging

---

**Framework**: React 19 + Vite + Material-UI  
**Cập nhật lần cuối**: September 2025
