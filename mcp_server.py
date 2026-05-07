"""
FileGenie MCP Server
--------------------
Exposes FileGenie document Q&A as MCP tools so Claude (claude.ai)
can query uploaded documents via connectors.

Runs on port 5001, proxied by nginx at /mcp/

Tools exposed:
  - query_documents : ask a question about uploaded documents
  - get_status      : check if documents are loaded for a user
"""

import httpx
import redis
import uuid
import json
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

PUBLIC_BASE_URL = "https://filegenie.nehanworks.site"

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

BACKEND_URL = "http://localhost:5000"

mcp = FastMCP(
    "FileGenie",
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=[
            "filegenie.nehanworks.site",
            "localhost:5001",
            "127.0.0.1:5001",
        ],
        allowed_origins=[
            "https://filegenie.nehanworks.site",
            "https://claude.ai",
        ],
    )
)


@mcp.tool()
def request_upload_url(filename: str, user_id: str = "mcp-default-user") -> str:
    """
    Generate a pre-signed upload URL for uploading a PDF to FileGenie.
    Returns a signed URL and instructions for uploading via curl.

    Workflow:
      1. Call this tool to get a signed URL
      2. Use curl in code execution to PUT the file to that URL
      3. Call query_documents with the same user_id

    Args:
        filename: Name of the PDF file to upload (e.g. "resume.pdf")
        user_id:  Session ID to associate this upload with.
    """
    if not filename.lower().endswith(".pdf"):
        return "Error: only PDF files are supported."

    token = str(uuid.uuid4())
    token_key = f"upload_token:{token}"

    token_data = json.dumps({"user_id": user_id, "filename": filename})
    redis_client.setex(token_key, 600, token_data)  # 10 minute TTL

    upload_url = f"{PUBLIC_BASE_URL}/upload_direct/{token}"

    return (
        f"Upload URL ready (valid for 10 minutes):\n\n"
        f"Run this curl command in code execution:\n\n"
        f"```bash\n"
        f'curl -X PUT "{upload_url}" \\\n'
        f'  --data-binary @/path/to/{filename} \\\n'
        f'  -H "Content-Type: application/pdf"\n'
        f"```\n\n"
        f"Replace /path/to/{filename} with the actual file path.\n"
        f"After upload completes, call query_documents with user_id: {user_id}"
    )


@mcp.tool()
def query_documents(question: str, user_id: str = "mcp-default-user") -> str:
    """
    Ask a question about documents uploaded to FileGenie.

    Args:
        question: The question to ask about the documents.
        user_id:  The user session ID. Use the same ID you used when uploading.
    """
    try:
        response = httpx.post(
            f"{BACKEND_URL}/query",
            json={"question": question},
            headers={"X-User-ID": user_id},
            timeout=60.0
        )
        data = response.json()

        if response.status_code != 200:
            return f"Error: {data.get('error', 'Unknown error from backend')}"

        answer = data.get("answer", "No answer returned.")
        chunks = data.get("num_chunks_used", 0)
        return f"{answer}\n\n[Retrieved from {chunks} document chunks]"

    except Exception as e:
        return f"Failed to query documents: {str(e)}"


@mcp.tool()
def get_status(user_id: str = "mcp-default-user") -> str:
    """
    Check whether documents have been uploaded and are ready to query.

    Args:
        user_id: The user session ID to check status for.
    """
    try:
        response = httpx.get(
            f"{BACKEND_URL}/status",
            headers={"X-User-ID": user_id},
            timeout=10.0
        )
        data = response.json()

        if data.get("has_documents"):
            return (
                f"Ready. {data['document_count']} document chunks loaded "
                f"for user '{user_id}'. You can now call query_documents."
            )
        else:
            return (
                f"No documents loaded for user '{user_id}'. "
                f"Please upload a PDF via https://filegenie.nehanworks.site first."
            )
    except Exception as e:
        return f"Failed to get status: {str(e)}"


if __name__ == "__main__":
    import uvicorn
    # mount_path tells the server it's served under /mcp/ via nginx
    # so it returns /mcp/messages/?session_id=xxx instead of /messages/?session_id=xxx
    app = mcp.sse_app(mount_path="/mcp")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5001,
        forwarded_allow_ips="*",
        proxy_headers=True
    )
