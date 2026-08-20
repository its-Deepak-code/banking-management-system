import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI environment variable is not set")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=30000
)

db = client["banking_database"]

accounts_collection = db["accounts"]
transactions_collection = db["transactions"]
users_collection = db["users"]

client.admin.command("ping")

print("MongoDB connected")