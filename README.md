# SilentBond

SilentBond is a confession-based platform designed to provide users with a safe and anonymous space to share their thoughts. It is powered by Redis and MongoDB for efficient data storage and real-time interactions using Socket.io.

## Features
- **Anonymous Confessions**: Users can post confessions without revealing their identity.
- **Real-Time Updates**: Utilizes Socket.io for live interactions.
- **Secure Backend**: Built with Node.js and Express, featuring Swagger API documentation.
- **Modern UI**: Developed using Next.js and Tailwind CSS for a fast and responsive experience.
- **Moderation**: Admin panel to manage and review content.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-Time Communication**: Socket.io
- **API Documentation**: Swagger
- **Cache**: Redis
- **Deployment**: Netlify (Frontend), (Specify backend deployment platform, e.g., AWS, DigitalOcean, etc.)

## Installation

### Prerequisites
- Node.js and npm/yarn
- MongoDB and Redis installed and running

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-url.git
   cd silentbond

2. Install dependencies:
   ```bash
   cd frontend
   npm install  # or yarn install

3. Create a .env file in the backend directory   with
   ```bash
   MONGO_URI=mongodb://localhost:27017/dbname
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key
   PORT=

4. Run the backend server:
   ```bash
   cd backend
   npm start

5. Run the frontend:
    ```bash
   cd backend
   npm start

**Deployment Frontend:** Deployed on Netlify. 
**Backend:** Deployed on Render

## Contributing
Feel free to submit issues or pull requests if you find any improvements.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or support, reach out at [shubhamdanecha789@gmail.com, divyshah2066@gmail.com, digitech.harsh003@gmail.com]