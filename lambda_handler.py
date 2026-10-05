"""AWS Lambda entry point for FileGenie."""
import os
from asgiref.wsgi import WsgiToAsgi
from mangum import Mangum

os.environ.setdefault("FILEGENIE_STORAGE_BACKEND", "s3")
from app import app

asgi_app = WsgiToAsgi(app)
handler = Mangum(asgi_app, lifespan="off")
