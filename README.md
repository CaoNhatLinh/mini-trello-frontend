#  Mini Trello Frontend

The Mini Trello frontend application is built with React 19, Vite, and Material-UI.

## Frontend Architecture
### Tech Stack
- **React 19** with **Vite** as the build tool
- **Material-UI (MUI)**: UI components
- **React Router Dom**: navigation
- **Socket.IO Client**: real-time communication
- **Zustand**: state management
- **React DnD**: drag & drop functionality
- **Axios**: API calls
- **Date-fns**: date formatting

### Folder Structure
```
src/
├── App.jsx                               # Main App component with routing
├── main.jsx                              # Entry point
├── assets/                               # Static assets (images, icons)
├── components/                           # Reusable components
│   ├── auth/                             # Authentication components
│   │   ├── Login.jsx                     # Login form with email verification
│   │   ├── GitHubCallback.jsx            # GitHub OAuth callback handler
│   │   └── ProtectedRoute.jsx            # Route protection wrapper
│   ├── boards/                           # Board management components
│   │   ├── BoardColumns.jsx              # Kanban board layout
│   │   ├── BoardHeader.jsx               # Board title and member management
│   │   ├── BoardSettings.jsx             # Board settings dialog
│   │   ├── DeleteBoardDialog.jsx         # Delete confirmation dialog
│   │   ├── EditBoardDialog.jsx           # Edit board dialog
│   │   ├── InvitationList.jsx            # Board invitations list
│   │   ├── InviteMember.jsx              # Invite member dialog
│   │   ├── ListDialog.jsx                # Create/edit column dialog
│   │   └── PendingInvitations.jsx        # User's pending invitations
│   ├── layout/                           # Layout components
│   │   ├── Layout.jsx                    # Main layout wrapper
│   │   └── Navbar.jsx                    # Navigation bar
│   ├── notifications/                    # Notification system
│   │   ├── NotificationIcon.jsx          # Bell icon with badge
│   │   ├── NotificationList.jsx          # Dropdown notification list
│   │   └── NotificationManager.jsx       # Notification state management
│   └── tasks/                            # Task management components
│       ├── CardColumn.jsx                # Individual column component
│       ├── TaskCard.jsx                  # Task card component
│       ├── TaskDetailDialog.jsx          # Task detail modal
│       ├── TaskMemberAssignment.jsx      # Member assignment component
│       ├── GitHubIntegration.jsx         # GitHub attachment UI
│       ├── GitHubAttachmentDialog.jsx
│       ├── GitHubAttachmentIndicator.jsx
│       ├── GitHubAttachmentList.jsx
│       └── GitHubAttachmentSummary.jsx
│    
├── contexts/                             # React contexts
│   └── AuthContext.jsx                   # Authentication context
├── hooks/                                # Custom hooks
│   ├── useGitHubAttachments.js           # GitHub attachments hook
│   └── useRealTimeUpdates.js             # Socket.IO real-time updates
├── pages/                                # Page components
│   ├── Dashboard.jsx                     # Main dashboard with board list
│   └── BoardView.jsx                     # Board detail with Kanban view
├── services/                             # API and external services
│   ├── api.js                            # Axios API client
│   └── socketService.js                  # Socket.IO client
└── utils/                                # Utility functions
    ├── index.js                          # General utilities
    └── store.js                          # Zustand store definitions

```

## Core Features

### Authentication & User Management
- **Email Verification Login**: Login via email with verification codes

![image](https://github.com/user-attachments/assets/6916d93f-d435-47a7-8d6c-9e310be93c9d)
    <img center src="https://github.com/user-attachments/assets/a84e2b3c-5aea-4adf-831e-721ed4c6cf92" title="Send code email" height="300">
    <img height="300" center  alt="image" src="https://github.com/user-attachments/assets/c70770f1-1af2-4e61-af84-8ff04826e926" />
- **GitHub OAuth Integration**: Link GitHub account
![image](https://github.com/user-attachments/assets/ac9bc7b3-1140-4c62-9d89-c7d5137ec805)

- **Protected Routes**: Route protection for authenticated users

### Dashboard & Board Management
- **Board Creation**: Create new boards with name and description
- **Board List View**: Display all user boards
- **Board Access Control**: Owner and member permissions
- **Board Settings**: Edit, delete, leave board options

<img height="250" alt="image" src="https://github.com/user-attachments/assets/380813d5-b349-4851-9acf-af92e00a7618" /><img height="250" alt="image" src="https://github.com/user-attachments/assets/3bb11b92-9e86-4340-a633-656f4e64079d" /><img  height="250" alt="image" src="https://github.com/user-attachments/assets/ad5a43fb-d0ec-4a53-9816-652d1abd1ac5" />

### Kanban Board Interface
- **Column Management**
- **Drag & Drop**
- **Real-time Updates**: Socket.IO updates on changes
- **Board Header**: Title, member list, actions

### Task Management
- **Task CRUD**
- **Task Details**
- **Member Assignment**
- **Quick Add Task**

![image](https://github.com/user-attachments/assets/016f6776-42f4-492b-a50e-8947f75af828)
![image](https://github.com/user-attachments/assets/8d984a99-6376-41fc-a75c-e2a2acde1881)
![image](https://github.com/user-attachments/assets/bad9f68c-5942-4978-870f-0b74ebe09e49)

<img  height="400" alt="image" src="https://github.com/user-attachments/assets/89d455f8-0385-4a1d-be70-dc558117c407" />

### Member & Invitation Management
- **Invite Members**: Send invitations via email/notification
- **Accept/Decline**: Respond to board invitations
- **Member List**: Display all board members


<img alt="image" src="https://github.com/user-attachments/assets/d23f4e92-17ed-431c-8a21-81a19c74f2c7" />
<img height="282" alt="image" src="https://github.com/user-attachments/assets/507ff979-9f91-4364-aad4-2a4b1aec98f2" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/169ba108-556d-4161-b44c-56b4fb53ce07" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/f93eaf8f-2e0f-4e00-88ea-b344c412a567" />



### GitHub Integration
- **Repository Access**: Xem danh sách repositories
- **GitHub attachments (pull requests, commits, issues)**

<img height="300" alt="image" src="https://github.com/user-attachments/assets/67fde94e-871b-43ef-a5f3-99bbc143652a" /><img height="300" alt="image" src="https://github.com/user-attachments/assets/2175111a-0eff-4968-afe9-ff5702eff66f" /><img height="300" alt="image" src="https://github.com/user-attachments/assets/23e709d4-7c73-43e0-b968-7fd740bb4e49" /><img height="300" alt="image" src="https://github.com/user-attachments/assets/abef74d8-6e11-448c-8ea3-644ddb21c19d" />

### Real-time Notifications
- **Notification Bell**: Icon with unread count badge
- **Notification Dropdown**: List notifications with action
- **Real-time Updates**: Socket.IO powered notifications
- **Board Invitations**: Notifications for board invitations
- **Task Updates**: Notifications when tasks are updated

### UI/UX Features
- **Responsive Design**: Mobile-friendly interface
- **Material-UI Theme**: Consistent Google Material Design
- **Loading States**: Skeleton screens và spinners
- **Error Handling**: User-friendly error messages


## Development

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

## Build & Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
1. **Vercel**: Zero-config deployment
2. **Netlify**: Static site hosting
3. **AWS S3 + CloudFront**: Scalable solution
4. **Docker**: Containerized deployment

## Debugging & Troubleshooting

### Common Issues
1. **Socket.IO Connection**: Check CORS and network settings
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
### backend
[mini-trello-backend](https://github.com/CaoNhatLinh/mini-trello-backend)


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email caonhatlinh1312@gmail.com or create an issue in the repository.

