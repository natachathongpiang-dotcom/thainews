import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


def predict(text: str, threshold=0.5):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)

    # IMPORTANT: ใช้ sigmoid (multi-label)
    probs = torch.sigmoid(outputs.logits).cpu().numpy()[0]

    results = []
    all_scores = {}

    for i, prob in enumerate(probs):
        label = model.config.id2label[i]

        score = float(prob * 100)
        all_scores[label] = round(score, 2)

       
        if prob >= threshold:
            results.append({
                "category": label,
                "confidence": round(score, 2)
            })

   
    results = sorted(results, key=lambda x: x["confidence"], reverse=True)

    
    if len(results) == 0:
        top_idx = int(np.argmax(probs))
        results.append({
            "category": model.config.id2label[top_idx],
            "confidence": round(probs[top_idx] * 100, 2)
        })

    return {
        "category": results[0]["category"],
        "confidence": results[0]["confidence"],
        "all_scores": all_scores,   
        "filtered": results         
    }