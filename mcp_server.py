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
from mcp.server.fastmcp import FastMCP

BACKEND_URL = "http://localhost:5000"

mcp = FastMCP("FileGenie")


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
    # SSE transport — Claude.ai connectors connect to /sse
    app = mcp.sse_app()
    uvicorn.run(app, host="0.0.0.0", port=5001)
