from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from supabase_client import supabase
from model_loader import predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    text: str
    user_id: str


# แปลง numpy → float (กัน error float32)
def to_float(x):
    try:
        return float(x)
    except:
        return 0.0


# วิเคราะห์ข่าว
@app.post("/analyze")
def analyze_news(req: NewsRequest):

    prediction = predict(req.text)

    
    filtered = []
    for item in prediction.get("filtered", []):
        filtered.append({
            "category": item["category"],
            "confidence": to_float(item["confidence"])
        })

   
    if len(filtered) > 0:
        top = filtered[0]
    else:
        top = {
            "category": "unknown",
            "confidence": 0.0
        }

    # เตรียมข้อมูล
    data = {
        "text": req.text[:100],
        "category": top["category"],
        "confidence": top["confidence"],  
        "user_id": req.user_id
    }

    # save ลง Supabase
    supabase.table("news_history").insert(data).execute()

    # ดึง 3 ล่าสุด (ใหม่อยู่บน)
    history = supabase.table("news_history") \
        .select("*") \
        .eq("user_id", req.user_id) \
        .order("id", desc=True) \
        .limit(3) \
        .execute()

    return {
        "result": {
            "filtered": filtered,   # ส่งให้ frontend
            "all_scores": prediction.get("all_scores", {})
        },
        "history": history.data
    }



@app.get("/history/{user_id}")
def get_history(user_id: str):

    history = supabase.table("news_history") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("id", desc=True) \
        .limit(3) \
        .execute()

    return history.data


