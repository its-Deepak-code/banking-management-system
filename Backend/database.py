from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["banking_database"]

accounts_collection = db["accounts"]

transactions_collection = db["transactions"]

users_collection = db["users"]

print("MongoDB connected")