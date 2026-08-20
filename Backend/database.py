import os
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))

db = client["banking_database"]

accounts_collection = db["accounts"]
transactions_collection = db["transactions"]
users_collection = db["users"]

print("MongoDB connected")