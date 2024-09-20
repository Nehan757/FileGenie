# FileGenie: AI-Powered Document Q&A Application

## 🚀 Personal Project by Nehan Tanwar

FileGenie is an advanced document Q&A application I developed to showcase my skills in full-stack development, AI integration, and cloud deployment. This project demonstrates my ability to work with cutting-edge technologies and create practical, user-friendly applications.

### 🛠 Key Technologies & Skills Demonstrated
- **Frontend**: React, JavaScript, HTML, CSS
- **Backend**: Python, Flask
- **AI & Machine Learning**: Langchain, Google Generative AI, Groq
- **Database**: FAISS (Facebook AI Similarity Search)
- **Cloud Deployment**: Render, AWS
- **Version Control**: Git, GitHub
- **API Integration**: RESTful API design and implementation
- **Security**: AWS S3, AWS Secrets Manager, CORS configuration

### 🔗 Live Demo

Experience FileGenie in action: [https://filegenie.com](https://filegenie-1.onrender.com/)

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed Python 3.11 or later
* You have installed Node.js 14.0 or later
* You have a Google API key for Google Generative AI
* You have a Groq API key

## Setting up FileGenie

To set up FileGenie, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/FileGenie.git
   cd FileGenie
   ```

2. Set up the backend:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the `backend` directory with the following content:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

## Running FileGenie Locally

To run FileGenie on your local machine, follow these steps:

1. Start the backend server:
   ```
   cd backend
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   python app.py
   ```
   The backend server will start running on `http://localhost:5000`.

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```
   The frontend development server will start running on `http://localhost:3000`.

3. Open your web browser and navigate to `http://localhost:3000` to use FileGenie.

## Building for Production

To create a production build of the frontend:

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Create a production build:
   ```
   npm run build
   ```

This will create a `build` directory with a production build of your app.

## Additional Commands

- To run tests for the frontend:
  ```
  cd frontend
  npm test
  ```

- To eject from Create React App (note: this is a one-way operation):
  ```
  cd frontend
  npm run eject
  ```

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed.
2. Check that your `.env` file contains the correct API keys.
3. Make sure both backend and frontend servers are running.

For any persistent problems, please open an issue on the GitHub repository.

## 🤝 Contributing

While FileGenie is primarily a personal project to showcase my skills, I'm open to collaboration and feedback. If you'd like to contribute or have suggestions, please feel free to:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📬 Contact & Social

- **LinkedIn**: [LinkedIn](https://www.linkedin.com/in/yourusername/)
- **Email**: nehantanwar012@gmail.com
- **Portfolio**: [Portfolio](https://portfolio-git-prod-nehan757s-projects.vercel.app/)

Feel free to reach out if you have any questions about the project or if you're interested in discussing potential opportunities!

## 📜 License

This project is open source and available under the [MIT License](LICENSE).