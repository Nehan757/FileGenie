from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_talisman import Talisman
from flask_session import Session
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import time
import logging
import tempfile
import json
import numpy as np
import faiss
import uuid
import shutil
from langchain_core.documents import Document

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask
app = Flask(__name__)

# Session configuration
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_DOMAIN'] = '.onrender.com'
Session(app)

# Security configurations
allowed_hosts = os.getenv('ALLOWED_HOSTS', '').split(',')
Talisman(app, force_https=True, content_security_policy=None)
CORS(app, resources={r"/*": {
    "origins": [
        "https://filegenie-1.onrender.com",
        "https://filegenie.nehanworks.space",
        "https://filegenie.onrender.com"
    ],
    "supports_credentials": True,
    "allow_headers": ["Content-Type"],
    "methods": ["GET", "POST", "OPTIONS"]
}})

# Get API keys from environment variables
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Use a temporary directory for uploads
UPLOAD_FOLDER = tempfile.gettempdir()
logging.info(f"Using upload folder: {UPLOAD_FOLDER}")

# User data storage
user_data = {}

@app.before_request
def before_request():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    
    user_id = session['user_id']
    if user_id not in user_data:
        user_folder = os.path.join(UPLOAD_FOLDER, user_id)
        os.makedirs(user_folder, exist_ok=True)
        user_data[user_id] = {
            'folder': user_folder,
            'index_path': os.path.join(user_folder, 'faiss_index.bin'),
            'docs_path': os.path.join(user_folder, 'documents.json')
        }

@app.route('/upload', methods=['POST'])
def upload_files():
    user_id = session['user_id']
    user_folder = user_data[user_id]['folder']
    
    logging.debug(f"Received upload request from user {user_id}")
    if 'files' not in request.files:
        logging.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('files')
    
    try:
        # Clear previous files
        for file in os.listdir(user_folder):
            os.remove(os.path.join(user_folder, file))
            
        for file in files:
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                file_path = os.path.join(user_folder, filename)
                file.save(file_path)
                logging.debug(f"Saved file for user {user_id}: {file_path}")
        
        vector_embedding(user_folder, user_id)
        return jsonify({'message': 'Files processed successfully'}), 200
    except Exception as e:
        logging.exception("Error during file upload")
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query_documents():
    user_id = session['user_id']
    if user_id not in user_data:
        return jsonify({'error': 'No active session'}), 400
        
    data = request.json
    if 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400

    try:
        index_path = user_data[user_id]['index_path']
        docs_path = user_data[user_id]['docs_path']
        
        if not os.path.exists(index_path) or not os.path.exists(docs_path):
            return jsonify({'error': 'Please upload documents first'}), 400
            
        index = faiss.read_index(index_path)
        with open(docs_path, "r") as f:
            documents = [Document.parse_obj(doc) for doc in json.load(f)]

        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        query_vector = embeddings.embed_query(data['question'])
        k = 5
        D, I = index.search(np.array([query_vector]), k)

        context = [documents[i].page_content for i in I[0]]

        llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192")
        prompt = ChatPromptTemplate.from_template("""
        Answer the questions based on the provided context only.
        Please provide the most accurate response based on the question
        <context>
        {context}
        </context>
        Question: {input}
        """)
        chain = prompt | llm

        response = chain.invoke({"context": "\n".join(context), "input": data['question']})

        return jsonify({
            'answer': response.content,
            'context': context
        }), 200
    except Exception as e:
        logging.exception("Error during document query")
        return jsonify({'error': str(e)}), 500

def vector_embedding(pdf_folder, user_id):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        loader = PyPDFDirectoryLoader(pdf_folder)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs)

        dimension = len(embeddings.embed_query("test"))
        index = faiss.IndexFlatL2(dimension)

        for doc in final_documents:
            vec = embeddings.embed_query(doc.page_content)
            index.add(np.array([vec]))

        faiss.write_index(index, user_data[user_id]['index_path'])
        with open(user_data[user_id]['docs_path'], "w") as f:
            json.dump([doc.dict() for doc in final_documents], f)

        logging.info(f"Vector embedding completed for user {user_id}")
    except Exception as e:
        logging.exception("Error during vector embedding")
        raise

@app.route('/cleanup', methods=['POST'])
def cleanup_session():
    user_id = session.pop('user_id', None)
    if user_id and user_id in user_data:
        try:
            shutil.rmtree(user_data[user_id]['folder'])
            del user_data[user_id]
            return jsonify({'message': 'Session cleaned up'}), 200
        except Exception as e:
            logging.exception("Error during cleanup")
            return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'No session to clean'}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
