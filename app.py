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
import datetime

# Load environment variables
load_dotenv()

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO if os.environ.get('FLASK_ENV') == 'production' else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
    handlers=[
        logging.StreamHandler()  # Only console output for Render
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)

# Session configuration for production
app.config.update(
    SECRET_KEY=os.urandom(24),
    SESSION_TYPE='filesystem',
    SESSION_COOKIE_SECURE=True,  # HTTPS required in production
    SESSION_COOKIE_SAMESITE='None',  # Allow cross-site cookies
    SESSION_COOKIE_DOMAIN=None,
    SESSION_COOKIE_HTTPONLY=True,
    PERMANENT_SESSION_LIFETIME=datetime.timedelta(minutes=30)
)
Session(app)

# Update CORS configuration to allow credentials
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://filegenie-1.onrender.com",
        "https://filegenie.nehanworks.space",
        "https://filegenie.onrender.com",
        "https://nehanworks.space"
    ],
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "OPTIONS"],
    "expose_headers": ["Content-Range", "X-Content-Range"]
}})

# Get API keys from environment variables
groq_api_key = os.getenv('GROQ_API_KEY')
google_api_key = os.getenv("GOOGLE_API_KEY")
os.environ["GOOGLE_API_KEY"] = google_api_key

logger.info(f"Starting FileGenie application...")
logger.info(f"Groq API Key present: {'Yes' if groq_api_key else 'No'}")
logger.info(f"Google API Key present: {'Yes' if google_api_key else 'No'}")

# Use a temporary directory for uploads
UPLOAD_FOLDER = tempfile.gettempdir()
logger.info(f"Using upload folder: {UPLOAD_FOLDER}")

# User data storage
user_data = {}

@app.route('/', methods=['GET'])
def index():
    logger.info("Root endpoint accessed")
    return jsonify({
        'message': 'FileGenie API is running',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'health': '/health',
            'status': '/status', 
            'upload': '/upload (POST)',
            'query': '/query (POST)',
            'cleanup': '/cleanup (POST)'
        }
    }), 200

@app.before_request
def before_request():
    logger.debug(f"Incoming request: {request.method} {request.path}")
    logger.debug(f"Request headers: {dict(request.headers)}")
    logger.debug(f"Request args: {dict(request.args)}")
    
    # Try to get user_id from custom header first, then from session
    user_id = request.headers.get('X-User-ID')
    
    if user_id:
        logger.debug(f"Using user_id from header: {user_id}")
        session['user_id'] = user_id
    elif 'user_id' not in session:
        user_id = str(uuid.uuid4())
        session['user_id'] = user_id
        logger.info(f"Created new session with user_id: {user_id}")
    else:
        user_id = session['user_id']
        logger.debug(f"Existing session user_id: {user_id}")
    
    logger.debug(f"Final user_id: {user_id}")
    
    if user_id not in user_data:
        user_folder = os.path.join(UPLOAD_FOLDER, user_id)
        os.makedirs(user_folder, exist_ok=True)
        user_data[user_id] = {
            'folder': user_folder,
            'index_path': os.path.join(user_folder, 'faiss_index.bin'),
            'docs_path': os.path.join(user_folder, 'documents.json')
        }
        logger.info(f"Created user folder structure for {user_id}: {user_folder}")
    else:
        logger.debug(f"User data already exists for {user_id}")

@app.route('/upload', methods=['POST'])
def upload_files():
    logger.info("=== UPLOAD REQUEST STARTED ===")
    user_id = session['user_id']
    user_folder = user_data[user_id]['folder']
    
    logger.info(f"Processing upload for user: {user_id}")
    logger.debug(f"User folder: {user_folder}")
    logger.debug(f"Request content type: {request.content_type}")
    logger.debug(f"Request files: {list(request.files.keys())}")
    
    if 'files' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('files')
    logger.info(f"Received {len(files)} files for upload")
    
    for i, file in enumerate(files):
        logger.debug(f"File {i+1}: {file.filename} (size: {file.content_length if hasattr(file, 'content_length') else 'unknown'})")
    
    try:
        logger.info("Step 1: Clearing previous files from user folder")
        # Clear previous files
        existing_files = os.listdir(user_folder)
        logger.debug(f"Found {len(existing_files)} existing files: {existing_files}")
        
        for file in existing_files:
            file_path = os.path.join(user_folder, file)
            os.remove(file_path)
            logger.debug(f"Removed existing file: {file_path}")
        
        logger.info("Step 2: Saving uploaded files")
        saved_files = []
        for file in files:
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                file_path = os.path.join(user_folder, filename)
                file.save(file_path)
                saved_files.append(filename)
                logger.info(f"Saved PDF file: {filename} to {file_path}")
                # Log file size
                file_size = os.path.getsize(file_path)
                logger.debug(f"File size: {file_size} bytes")
            else:
                logger.warning(f"Skipped non-PDF file: {file.filename if file else 'None'}")
        
        logger.info(f"Successfully saved {len(saved_files)} PDF files: {saved_files}")
        
        logger.info("Step 3: Starting vector embedding process")
        vector_embedding(user_folder, user_id)
        
        logger.info("=== UPLOAD REQUEST COMPLETED SUCCESSFULLY ===")
        return jsonify({
            'message': 'Files processed successfully', 
            'files_processed': saved_files,
            'user_id': user_id
        }), 200
        
    except Exception as e:
        logger.exception(f"Error during file upload: {str(e)}")
        logger.error(f"=== UPLOAD REQUEST FAILED ===")
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query_documents():
    logger.info("=== QUERY REQUEST STARTED ===")
    user_id = session['user_id']
    
    if user_id not in user_data:
        logger.error(f"No active session found for user_id: {user_id}")
        return jsonify({'error': 'No active session'}), 400
        
    logger.info(f"Processing query for user: {user_id}")
    logger.debug(f"Request content type: {request.content_type}")
    
    # Handle both JSON and form data
    if request.is_json:
        data = request.json
        logger.debug(f"Received JSON data: {data}")
    else:
        data = request.form.to_dict()
        logger.debug(f"Received form data: {data}")
    
    if 'question' not in data:
        logger.error("No question provided in request")
        return jsonify({'error': 'No question provided'}), 400
    
    question = data['question']
    logger.info(f"User question: '{question}'")

    try:
        index_path = user_data[user_id]['index_path']
        docs_path = user_data[user_id]['docs_path']
        
        logger.debug(f"Index path: {index_path}")
        logger.debug(f"Documents path: {docs_path}")
        
        if not os.path.exists(index_path) or not os.path.exists(docs_path):
            logger.error(f"Required files missing - Index exists: {os.path.exists(index_path)}, Docs exist: {os.path.exists(docs_path)}")
            return jsonify({'error': 'Please upload documents first'}), 400
        
        logger.info("Step 1: Loading FAISS index")
        index = faiss.read_index(index_path)
        logger.debug(f"FAISS index loaded successfully. Total vectors: {index.ntotal}")
        
        logger.info("Step 2: Loading document chunks")
        with open(docs_path, "r") as f:
            documents = [Document.parse_obj(doc) for doc in json.load(f)]
        logger.debug(f"Loaded {len(documents)} document chunks")

        logger.info("Step 3: Generating query embedding")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        query_vector = embeddings.embed_query(question)
        logger.debug(f"Query embedding generated. Vector dimension: {len(query_vector)}")
        
        logger.info("Step 4: Performing similarity search")
        k = 5
        D, I = index.search(np.array([query_vector]), k)
        logger.debug(f"Similarity search completed. Found {len(I[0])} similar chunks")
        logger.debug(f"Similarity scores: {D[0].tolist()}")
        logger.debug(f"Document indices: {I[0].tolist()}")

        context = [documents[i].page_content for i in I[0]]
        logger.info(f"Step 5: Retrieved {len(context)} context chunks")
        for i, chunk in enumerate(context):
            logger.debug(f"Context chunk {i+1} (first 100 chars): {chunk[:100]}...")

        logger.info("Step 6: Initializing LLM and generating response")
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
        
        logger.debug("Sending request to LLM...")
        response = chain.invoke({"context": "\n".join(context), "input": question})
        logger.info(f"LLM response generated. Length: {len(response.content)} characters")
        logger.debug(f"LLM response (first 200 chars): {response.content[:200]}...")

        result = {
            'answer': response.content,
            'context': context,
            'num_chunks_used': len(context),
            'similarity_scores': D[0].tolist()
        }
        
        logger.info("=== QUERY REQUEST COMPLETED SUCCESSFULLY ===")
        return jsonify(result), 200
        
    except Exception as e:
        logger.exception(f"Error during document query: {str(e)}")
        logger.error("=== QUERY REQUEST FAILED ===")
        return jsonify({'error': str(e)}), 500

def vector_embedding(pdf_folder, user_id):
    logger.info(f"=== VECTOR EMBEDDING PROCESS STARTED for user {user_id} ===")
    try:
        logger.info("Step 1: Initializing Google embeddings")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        logger.debug("Google embeddings initialized successfully")
        
        logger.info("Step 2: Loading PDF documents")
        loader = PyPDFDirectoryLoader(pdf_folder)
        docs = loader.load()
        logger.info(f"Loaded {len(docs)} document pages from PDF files")
        
        for i, doc in enumerate(docs):
            logger.debug(f"Document {i+1}: {doc.metadata.get('source', 'unknown')} - Content length: {len(doc.page_content)} chars")
        
        logger.info("Step 3: Splitting documents into chunks")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs)
        logger.info(f"Split into {len(final_documents)} text chunks")
        
        for i, chunk in enumerate(final_documents[:3]):  # Log first 3 chunks as sample
            logger.debug(f"Sample chunk {i+1} (first 100 chars): {chunk.page_content[:100]}...")
        
        logger.info("Step 4: Creating FAISS index")
        dimension = len(embeddings.embed_query("test"))
        logger.debug(f"Embedding dimension: {dimension}")
        index = faiss.IndexFlatL2(dimension)
        logger.debug("FAISS index created")

        logger.info("Step 5: Generating embeddings and adding to index")
        for i, doc in enumerate(final_documents):
            if i % 10 == 0:  # Log progress every 10 documents
                logger.debug(f"Processing chunk {i+1}/{len(final_documents)}")
            
            vec = embeddings.embed_query(doc.page_content)
            index.add(np.array([vec]))
        
        logger.info(f"Added {index.ntotal} vectors to FAISS index")
        
        logger.info("Step 6: Saving FAISS index and documents")
        index_path = user_data[user_id]['index_path']
        docs_path = user_data[user_id]['docs_path']
        
        faiss.write_index(index, index_path)
        logger.debug(f"FAISS index saved to: {index_path}")
        
        with open(docs_path, "w") as f:
            json.dump([doc.dict() for doc in final_documents], f)
        logger.debug(f"Documents saved to: {docs_path}")
        
        # Log file sizes
        index_size = os.path.getsize(index_path)
        docs_size = os.path.getsize(docs_path)
        logger.info(f"Index file size: {index_size} bytes")
        logger.info(f"Documents file size: {docs_size} bytes")

        logger.info(f"=== VECTOR EMBEDDING COMPLETED SUCCESSFULLY for user {user_id} ===")
        
    except Exception as e:
        logger.exception(f"Error during vector embedding for user {user_id}: {str(e)}")
        logger.error(f"=== VECTOR EMBEDDING FAILED for user {user_id} ===")
        raise

@app.route('/cleanup', methods=['POST'])
def cleanup_session():
    logger.info("=== CLEANUP REQUEST STARTED ===")
    user_id = session.pop('user_id', None)
    logger.info(f"Cleaning up session for user: {user_id}")
    
    if user_id and user_id in user_data:
        try:
            user_folder = user_data[user_id]['folder']
            logger.debug(f"Removing user folder: {user_folder}")
            
            # List files before deletion
            if os.path.exists(user_folder):
                files_to_delete = os.listdir(user_folder)
                logger.debug(f"Files to delete: {files_to_delete}")
                shutil.rmtree(user_folder)
                logger.info(f"Successfully removed folder: {user_folder}")
            
            del user_data[user_id]
            logger.info(f"Removed user data for: {user_id}")
            logger.info("=== CLEANUP COMPLETED SUCCESSFULLY ===")
            return jsonify({'message': 'Session cleaned up'}), 200
        except Exception as e:
            logger.exception(f"Error during cleanup for user {user_id}: {str(e)}")
            logger.error("=== CLEANUP FAILED ===")
            return jsonify({'error': str(e)}), 500
    
    logger.info("No session to clean")
    logger.info("=== CLEANUP COMPLETED (NO-OP) ===")
    return jsonify({'message': 'No session to clean'}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.exception("Full exception traceback:")
    return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Health check endpoints for monitoring
@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check requested")
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'active_users': len(user_data),
        'upload_folder': UPLOAD_FOLDER
    }), 200

@app.route('/status', methods=['GET'])
def status_check():
    logger.info("Status check requested")
    user_id = session.get('user_id')
    
    status = {
        'has_session': user_id is not None,
        'user_id': user_id,
        'has_documents': False,
        'document_count': 0,
        'index_exists': False,
        'docs_file_exists': False
    }
    
    if user_id and user_id in user_data:
        index_path = user_data[user_id]['index_path']
        docs_path = user_data[user_id]['docs_path']
        
        status['index_exists'] = os.path.exists(index_path)
        status['docs_file_exists'] = os.path.exists(docs_path)
        
        if status['docs_file_exists']:
            try:
                with open(docs_path, 'r') as f:
                    docs = json.load(f)
                    status['document_count'] = len(docs)
                    status['has_documents'] = len(docs) > 0
            except Exception as e:
                logger.warning(f"Could not read docs file: {e}")
    
    logger.debug(f"Status response: {status}")
    return jsonify(status), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting FileGenie server on port {port}")
    logger.info(f"Server will be available at: http://localhost:{port}")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  GET  /status - Session status")
    logger.info("  POST /upload - Upload PDF files")
    logger.info("  POST /query - Ask questions")
    logger.info("  POST /cleanup - Clean session")
    app.run(host='0.0.0.0', port=port, debug=True)
