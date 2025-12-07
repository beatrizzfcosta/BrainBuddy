import os
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest

from app.services.firebase_service import db

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

REDIRECT_URI = "http://localhost:3000/auth/callback"


def create_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "project_id": "brainbuddy",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uris": [REDIRECT_URI],
                "javascript_origins": ["http://localhost:3000"]
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar"
        ],
        redirect_uri=REDIRECT_URI
    )

@router.get("/login")
async def login():
    flow = create_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )
    return {"url": auth_url}

@router.get("/callback")
async def callback(code: str):
    flow = create_flow()
    flow.fetch_token(code=code)


    credentials = flow.credentials

    userinfo = id_token.verify_oauth2_token(
        credentials.id_token, GoogleRequest(), GOOGLE_CLIENT_ID
    )

    user_id = userinfo.get("sub")

    users_collection = db.collection("users")
    user_ref = users_collection.document(user_id)
    user_doc = user_ref.get()

    user_data = {
        "name": userinfo.get("name"),
        "email": userinfo.get("email"),
        "googleCalendarConnected": True if credentials.refresh_token else False,
        "updatedAt": datetime.now(timezone.utc),
        "googleTokens": {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
        },
    }

    if not user_doc.exists:
        user_data["createdAt"] = datetime.now(timezone.utc)
        user_ref.set(user_data)
    else:
        existing = user_doc.to_dict()
        existing_created_at = existing.get("createdAt")
        # Se createdAt do Firebase for um timestamp, manter como está
        if existing_created_at:
            user_data["createdAt"] = existing_created_at
        else:
            user_data["createdAt"] = datetime.now(timezone.utc)
        user_ref.set(user_data, merge=True)

    # Converter datetimes para strings ISO antes de retornar
    response_user_data = {
        **user_data,
        "updatedAt": user_data["updatedAt"].isoformat() if isinstance(user_data["updatedAt"], datetime) else user_data["updatedAt"],
        "createdAt": user_data["createdAt"].isoformat() if isinstance(user_data["createdAt"], datetime) else user_data["createdAt"],
    }

    return JSONResponse({"id": user_id, "user": response_user_data})
