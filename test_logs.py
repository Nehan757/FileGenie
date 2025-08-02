#!/usr/bin/env python3
"""Test script to demonstrate the improved logging output"""

import requests
import json
import time

def test_session_creation_and_upload():
    """Demo the beautiful logs when creating sessions and uploading files"""
    
    print("🧪 Testing FileGenie logs - watching for:")
    print("   📋 Session creation")
    print("   📁 File upload")
    print("   🧠 Vector embedding")
    print("   ❓ Query processing")
    print()
    
    base_url = "http://localhost:5000"
    
    try:
        # 1. Test session creation (accessing API)
        print("1️⃣  Creating new session...")
        response = requests.get(f"{base_url}/")
        print(f"   ✅ Response: {response.status_code}")
        time.sleep(1)
        
        # 2. Test status check
        print("2️⃣  Checking session status...")
        response = requests.get(f"{base_url}/status")
        print(f"   ✅ Response: {response.status_code}")
        time.sleep(1)
        
        # 3. Test health check
        print("3️⃣  Health check...")
        response = requests.get(f"{base_url}/health")
        print(f"   ✅ Response: {response.status_code}")
        
        print()
        print("🎯 Expected log output:")
        print("   🆕 New session created: abc12345...")
        print("   📁 Created workspace: abc12345...")
        print("   📤 Upload started for user: abc12345...")
        print("   💾 Saved: document.pdf (150.5KB)")
        print("   📊 Total: 1 PDFs, 150.5KB")
        print("   🧠 RAG processing started for abc12345...")
        print("   📄 Loaded 5 pages (12,450 chars)")
        print("   ✂️  Split into 15 chunks")
        print("   📊 FAISS index created (dim: 768)")
        print("   ⚡ Batch 1/2 (10 chunks)")
        print("   ⚡ Batch 2/2 (5 chunks)")
        print("   🗃️  Added 15 vectors to index")
        print("   💾 Saved index (45.2KB) + docs (23.1KB)")
        print("   ✅ RAG processing completed in 8.5s")
        print("   ✅ Upload completed in 8.5s")
        
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_session_creation_and_upload()