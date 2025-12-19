# QRBankcardShared# Card Manager - Bank Card Management System

Modern, secure, and user-friendly bank card management system.

## 🚀 Features

- ✅ Add, edit, and delete bank cards
- 💳 Display cards with colorful and visual design
- 📱 Share cards via QR code (10-minute expiry)
- 🔐 JWT authentication
- 🎨 RGB color picker for customization
- 📋 Copy functionality
- 🌐 Responsive design (mobile, tablet, desktop)
- 🐳 Docker support

## 🛠️ Tech Stack

### Backend
- .NET 8 Web API
- PostgreSQL
- Entity Framework Core
- JWT Authentication
- Clean Architecture

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- Axios
- QRCode.js
- React Hot Toast

## 📦 Installation

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for development)
- .NET 8 SDK (for development)

### Quick Start

1. **Clone repository:**
```bash
git clone <repo-url>
cd card-manager
```

2. **Environment variables:**
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend - configured in docker-compose.yml
```

3. **Run with Docker:**
```bash
docker-compose up --build
```

4. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Database: localhost:5432

## 🔧 Development

### Backend Development
```bash
cd backend
dotnet restore
dotnet run --project CardManager.API
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migration
```bash
cd backend
dotnet ef migrations add MigrationName --project CardManager.Infrastructure --startup-project CardManager.API
dotnet ef database update --project CardManager.Infrastructure --startup-project CardManager.API
```

## 📱 Feature Details

### Card Management
- Add card (name, number, expiry, color)
- Edit card (name, expiry, color)
- Delete card
- Display full 16-digit number
- Copy card number

### QR Sharing
- Generate permanent QR code
- Shareable links (no expiration)
- Mobile responsive view
- Display full card details
- Access control via link sharing

### Authentication
- Register (username, email, password)
- Login (email, password)
- JWT token (7 days)
- Auto logout on 401

## 🔒 Security

- Password hashing (BCrypt)
- JWT authentication
- Card number encryption
- CORS policy
- SQL injection protection
- XSS protection

## 📄 API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/{id}` - Get card details
- `POST /api/cards` - Add new card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card
- `GET /api/cards/shared?token=xxx` - Get shared cards
- `GET /api/cards/generate-share-token` - Generate share token

## 🐳 Docker

### Build
```bash
docker-compose build
```

### Run
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### Logs
```bash
docker-compose logs -f
```

## 📁 Project Structure

```
card-manager/
├── backend/
│   ├── CardManager.Core/
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── DTOs/
│   ├── CardManager.Infrastructure/
│   │   ├── Data/
│   │   ├── Repositories/
│   │   ├── UnitOfWork/
│   │   └── Helpers/
│   ├── CardManager.Services/
│   │   └── Services/
│   ├── CardManager.API/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Dockerfile
│   └── CardManager.sln
├── frontend/
│   ├── public/
│   │   ├── manifest.json
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ColorPicker.tsx
│   │   │   ├── cards/
│   │   │   │   ├── CreditCard.tsx
│   │   │   │   ├── CardList.tsx
│   │   │   │   ├── AddCardModal.tsx
│   │   │   │   └── EditCardModal.tsx
│   │   │   └── QRModal.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── SharedCards.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── card.service.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── config.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🎯 Architecture

### Backend Architecture
- **Clean Architecture** pattern
- **Repository Pattern** for data access
- **Unit of Work** for transaction management
- **Dependency Injection** throughout
- **Middleware** for global exception handling

### Frontend Architecture
- **Component-based** structure
- **Context API** for state management
- **Custom hooks** for reusable logic
- **Service layer** for API communication
- **Type-safe** with TypeScript

## 🚀 Deployment

### Production Considerations
1. Change JWT secret in production
2. Use HTTPS
3. Configure CORS properly
4. Use environment-specific configurations
5. Enable rate limiting
6. Set up monitoring and logging
7. Use production-grade database credentials

### Environment Variables

**Backend (.NET):**
```
ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=cardmanager;Username=postgres;Password=YOUR_PASSWORD
Jwt__Secret=YOUR_SECRET_KEY_HERE
```

**Frontend (React):**
```
VITE_API_URL=https://your-api-domain.com/api
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📊 Database Schema

### Users Table
- `Id` (int, PK)
- `Username` (string)
- `Email` (string, unique)
- `PasswordHash` (string)
- `CreatedAt` (datetime)
- `UpdatedAt` (datetime)

### BankCards Table
- `Id` (int, PK)
- `UserId` (int, FK)
- `CardName` (string)
- `CardNumber` (string, encrypted)
- `CardType` (string)
- `ExpiryDate` (string)
- `CardColor` (string)
- `CreatedAt` (datetime)
- `UpdatedAt` (datetime)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Khanbala Rustamov**
- Software Engineer @ eManat
- GitHub: [@khanbala](https://github.com/khanbala)
- LinkedIn: [Khanbala Rustamov](https://linkedin.com/in/khanbala)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern card management systems
- Built with ❤️ using .NET and React

## 📞 Support

For support, email support@cardmanager.com or create an issue in the repository.

---

⭐ Star this repository if you find it helpful!