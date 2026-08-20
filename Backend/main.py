from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from banking import SavingsAccount, CurrentAccount
from database import (
    accounts_collection,
    transactions_collection,
    users_collection
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

accounts = {}

next_account_number = 1001


class AccountCreate(BaseModel):
    name: str
    balance: float
    account_type: str


class DepositRequest(BaseModel):
    amount: float

class WithdrawRequest(BaseModel):
    amount: float

class UserCreate(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str



def get_next_account_number():

    last_account = accounts_collection.find_one(
        sort=[("account_number", -1)]
    )

    if last_account is None:
        return 1001

    return last_account["account_number"] + 1

@app.get("/")
def home():

    return {
        "message": "Banking Management System API is running"
    }


@app.post("/accounts")
def create_account(data: AccountCreate):

    account_number = get_next_account_number()

    if data.account_type.lower() == "saving":

        account = SavingsAccount(
            data.name,
            data.balance
        )

    elif data.account_type.lower() == "current":

        account = CurrentAccount(
            data.name,
            data.balance
        )

    else:

        return {
            "success": False,
            "message": "Invalid account type"
        }


    account_data = {
        "account_number": account_number,
        "name": account.name,
        "balance": account.get_balance(),
        "account_type": data.account_type.lower()
    }

    accounts_collection.insert_one(account_data)

    return {
        "success": True,
        "message": "Account created successfully",
        "account_number": account_number,
        "name": account.name,
        "balance": account.get_balance(),
        "account_type": data.account_type
    }

@app.get("/accounts")
def get_all_accounts():

    account_list = list(accounts_collection.find({}, {"_id": 0}))

    return {
        "success": True,
        "total_accounts": len(account_list),
        "accounts": account_list
    }

@app.post("/accounts/{account_number}/deposit")
def deposit_money(account_number: int, data: DepositRequest):

    account = accounts_collection.find_one(
        {"account_number": account_number}
    )

    if account is None:
        return {
            "success": False,
            "message": "Account not found"
        }

    if data.amount <= 0:
        return {
            "success": False,
            "message": "Deposit amount must be greater than 0"
        }

    new_balance = account["balance"] + data.amount

    accounts_collection.update_one(
            {"account_number": account_number},
            {"$set": {"balance": new_balance}}
        )

    transactions_collection.insert_one({
            "account_number": account_number,
            "type": "deposit",
            "amount": data.amount,
            "balance_after_transaction": new_balance,
            "date": datetime.now()
        })

    accounts_collection.update_one(
        {"account_number": account_number},
        {"$set": {"balance": new_balance}}
    )

    return {
        "success": True,
        "message": "Money deposited successfully",
        "account_number": account_number,
        "deposited_amount": data.amount,
        "new_balance": new_balance
    }


@app.post("/accounts/{account_number}/withdraw")
def withdraw_money(account_number: int, data: WithdrawRequest):

    account = accounts_collection.find_one(
        {"account_number": account_number}
    )

    if account is None:
        return {
            "success": False,
            "message": "Account not found"
        }

    if data.amount <= 0:
        return {
            "success": False,
            "message": "Withdrawal amount must be greater than 0"
        }

    if data.amount > account["balance"]:
        return {
            "success": False,
            "message": "Insufficient balance"
        }

    new_balance = account["balance"] - data.amount

    accounts_collection.update_one(
            {"account_number": account_number},
            {"$set": {"balance": new_balance}}
        )

    transactions_collection.insert_one({
            "account_number": account_number,
            "type": "withdraw",
            "amount": data.amount,
            "balance_after_transaction": new_balance,
            "date": datetime.now()
        })
    
    accounts_collection.update_one(
        {"account_number": account_number},
        {"$set": {"balance": new_balance}}
    )

    return {
        "success": True,
        "message": "Money withdrawn successfully",
        "account_number": account_number,
        "withdrawn_amount": data.amount,
        "new_balance": new_balance
    }

@app.get("/accounts/{account_number}/transactions")
def get_transactions(account_number: int):

    account = accounts_collection.find_one(
        {"account_number": account_number}
    )

    if account is None:
        return {
            "success": False,
            "message": "Account not found"
        }

    transactions = list(
            transactions_collection.find(
                {"account_number": account_number},
                {"_id": 0}
            )
        ) 

    for transaction in transactions:
        transaction["date"] = transaction["date"].isoformat()

    return {
        "success": True,
        "account_number": account_number,
        "transactions": transactions
    }

@app.get("/accounts/{account_number}")
def get_account(account_number: int):

    account = accounts_collection.find_one(
        {"account_number": account_number},
        {"_id": 0}
    )

    if account is None:
        return {
            "success": False,
            "message": "Account not found"
        }

    return {
        "success": True,
        "account": account
    }


@app.delete("/accounts/{account_number}")
def delete_account(account_number: int):

    account = accounts_collection.find_one(
        {"account_number": account_number}
    )

    if account is None:
        return {
            "success": False,
            "message": "Account not found"
        }

    accounts_collection.delete_one(
        {"account_number": account_number}
    )

    transactions_collection.delete_many(
        {"account_number": account_number}
    )

    return {
        "success": True,
        "message": "Account deleted successfully",
        "account_number": account_number,
        "name": account["name"]
    }

@app.post("/register")
def register_user(data: UserCreate):

    username = data.username.strip()
    password = data.password

    # Username required
    if not username:
        return {
            "success": False,
            "message": "Username is required"
        }

    # Username minimum length
    if len(username) < 3:
        return {
            "success": False,
            "message": "Username must be at least 3 characters"
        }

    # Username validation
    if not username.replace("_", "").isalnum():
        return {
            "success": False,
            "message": "Username can contain only letters, numbers and underscore"
        }

    # Password required
    if not password:
        return {
            "success": False,
            "message": "Password is required"
        }

    # Password minimum length
    if len(password) < 8:
        return {
            "success": False,
            "message": "Password must be at least 8 characters"
        }

    # Uppercase validation
    if not any(char.isupper() for char in password):
        return {
            "success": False,
            "message": "Password must contain at least one uppercase letter"
        }

    # Lowercase validation
    if not any(char.islower() for char in password):
        return {
            "success": False,
            "message": "Password must contain at least one lowercase letter"
        }

    # Number validation
    if not any(char.isdigit() for char in password):
        return {
            "success": False,
            "message": "Password must contain at least one number"
        }

    # Check duplicate username
    existing_user = users_collection.find_one(
        {"username": username}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Username already exists"
        }

    # Create user
    user_data = {
        "username": username,
        "password": password
    }

    users_collection.insert_one(user_data)

    return {
        "success": True,
        "message": "User registered successfully",
        "username": username
    }
@app.post("/login")
def login_user(data: LoginRequest):

    user = users_collection.find_one(
        {
            "username": data.username,
            "password": data.password
        }
    )

    if user is None:
        return {
            "success": False,
            "message": "Invalid username or password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "username": user["username"]
    }

