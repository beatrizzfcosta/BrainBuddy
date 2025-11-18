import os
import logging
from fastapi import APIRouter, HTTPException, status
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

logger = logging.getLogger(__name__)

YOUTUBE_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_client():
    if not YOUTUBE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A variável YOUTUBE_API_KEY não foi encontrada."
        )
    return build("youtube", "v3", developerKey=YOUTUBE_KEY)


@router.get("/search")
def youtube_search(query: str, max_results: int = 5):
   #Retorna apenas link e URL
    try:
        youtube = get_youtube_client()

        response = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=max_results,
        ).execute()

        items = response.get("items", [])
        results = []

        for item in items:
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]

            results.append({
                "title": title,
                "url": f"https://www.youtube.com/watch?v={video_id}"
            })

        return {"query": query, "results": results}

    except Exception as e:
        logger.exception("Erro ao pesquisar no YouTube: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao chamar YouTube API: {str(e)}"
        )
