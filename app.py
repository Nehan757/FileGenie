from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import time
import logging
import tempfile

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
# Update CORS configuration for specific frontend URL
CORS(app, resources={r"/*": {"origins": "https://filegenie-1.onrender.com"}})

# Get API keys from environment variables
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Use a temporary directory for uploads
UPLOAD_FOLDER = tempfile.gettempdir()
logging.info(f"Using upload folder: {UPLOAD_FOLDER}")


@app.route('/upload', methods=['POST'])
def upload_files():
    logging.debug(f"Received upload request: {request.files}")
    if 'files' not in request.files:
        logging.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('files')

    try:
        for file in files:
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                logging.debug(f"Saved file: {file_path}")

        vector_embedding(UPLOAD_FOLDER)
        return jsonify({'message': 'Files processed successfully'}), 200
    except Exception as e:
        logging.exception("Error during file upload")
        return jsonify({'error': str(e)}), 500


@app.route('/query', methods=['POST'])
def query_documents():
    data = request.json
    if 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400

    try:
        llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192")
        prompt = ChatPromptTemplate.from_template("""
        Answer the questions based on the provided context only.
        Please provide the most accurate response based on the question
        <context>
        {context}
        </context>
        Question: {input}
        """)
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = app.config.get('vectors', FAISS.load_local("faiss_index", GoogleGenerativeAIEmbeddings(
            model="models/embedding-001"))).as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        start = time.process_time()
        response = retrieval_chain.invoke({'input': data['question']})
        logging.debug(f"Response time: {time.process_time() - start}")

        return jsonify({
            'answer': response['answer'],
            'context': [doc.page_content for doc in response['context']]
        }), 200
    except Exception as e:
        logging.exception("Error during document query")
        return jsonify({'error': str(e)}), 500


def vector_embedding(pdf_files):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        loader = PyPDFDirectoryLoader(pdf_files)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs)
        vectors = FAISS.from_documents(final_documents, embeddings)
        app.config['vectors'] = vectors
        vectors.save_local("faiss_index")
        logging.info("Vector embedding completed successfully")
    except Exception as e:
        logging.exception("Error during vector embedding")
        raise


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)