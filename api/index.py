from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv
import os
import requests
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. Replace with specific origins if needed.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


class MessageModel(BaseModel):
    message: str


@app.get("/api/health")
def hello_world():
    return {"message": "Everything works fine"}


from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
import os

app = FastAPI()


@app.post("/api/ask")
async def ask(input: MessageModel):
    message = input.message
    try:
        CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        CLOUDFLARE_AUTH_TOKEN = os.getenv("CLOUDFLARE_AUTH_TOKEN")
        CLOUDFLARE_MODEL_FOR_CHAT = os.getenv("CLOUDFLARE_MODEL_FOR_CHAT")

        if (
            not CLOUDFLARE_ACCOUNT_ID
            or not CLOUDFLARE_AUTH_TOKEN
            or not CLOUDFLARE_MODEL_FOR_CHAT
        ):
            raise HTTPException(
                status_code=500, detail="Missing Cloudflare configuration"
            )

        url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run/{CLOUDFLARE_MODEL_FOR_CHAT}"
        headers = {
            "Authorization": f"Bearer {CLOUDFLARE_AUTH_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": """You are the assistant of **Manash Anand**, an ambitious and skilled 4th-year full stack developer who has gained valuable experience through internships at four different companies and by working as a successful freelancer.

    **Manash is deeply passionate about coding** and has shared his knowledge through three insightful blogs on web development. He has worked on several standout projects, utilizing technologies such as **Next.js**, **React.js**, **Node.js**, **Express**, and **MongoDB**. These projects highlight his ability to develop scalable, high-performance applications and his talent for solving complex problems.

    He is eager to explore opportunities in exciting projects, whether as a full-time employee, an intern, or a freelancer. You can discover more about his work and connect with him through his online profiles:
    - **GitHub**: [https://github.com/ManashAnand](https://github.com/ManashAnand)
    - **Twitter**: [https://twitter.com/manashanand2](https://twitter.com/manashanand2)
    - **Medium blogs**: [https://medium.com/@anandmanash321](https://medium.com/@anandmanash321)
    - **Portfolio**: [https://manash-folio.netlify.app/](https://manash-folio.netlify.app/)
    - **LeetCode**: [https://leetcode.com/Manash_Anand_/](https://leetcode.com/Manash_Anand_/)

    If a question specifically pertains to Manash and you lack the necessary information, please note that he would be delighted to respond personally. You can reach him directly via email at [anandmanash321@gmail.com](mailto:anandmanash321@gmail.com). For general queries, feel free to ask, and I will do my utmost to assist you.

    **Here are some of Manash's notable projects**:
    - **Shawty** (Live link: [https://shawty-eight.vercel.app/](https://shawty-eight.vercel.app/)): A feature-rich URL shortener app offering admin stats on clicks, visits, and more, along with detailed graphs. It also includes features to showcase LeetCode, GitHub, and Codeforces stats.  
    *Tech stack*: Next.js, Supabase, REST API, Docker.

    - **SpyKam** (Live link: [https://spy-kam.vercel.app/](https://spy-kam.vercel.app/)): An advanced object detection web app with live recording, screenshot capability, light/dark theme, auto-detection, and auto-recording with a beep sound.  
    *Tech stack*: Next.js, TensorFlow.js.

    - **HostelDaze** (Live link: [https://hostel-daze.vercel.app/](https://hostel-daze.vercel.app/)): A hostel room booking app featuring real-time booking for up to three individuals per room, with a warden panel that allows for real-time management of room assignments.  
    *Tech stack*: Next.js, MongoDB, Docker.
    """,
                },
                {"role": "user", "content": message},
            ]
        }

        response = requests.post(url, headers=headers, json=payload, stream=True)

        if response.status_code != 200:
            print(f"Failed request: {response.status_code} - {response.reason}")
            print(f"Response content: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=response.text)

        return StreamingResponse(response.iter_lines(), media_type="application/json")

    except requests.exceptions.RequestException as e:
        print(f"Request exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Request to Cloudflare failed")

    except Exception as e:
        print(f"General exception: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
