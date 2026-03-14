import json
import redis.asyncio as redis
from app.core.config import settings

class QueueService:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.redis = None

    async def connect(self):
        if not self.redis:
            self.redis = await redis.from_url(self.redis_url, decode_responses=True)

    async def broadcast_new_case(self, case_data: dict):
        """
        Publishes a message to the 'triage_updates' channel.
        """
        await self.connect()
        message = json.dumps(case_data)
        await self.redis.publish("triage_updates", message)

queue_service = QueueService()
