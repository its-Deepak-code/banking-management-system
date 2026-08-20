class BankAccount:

    def __init__(self, name, balance=0):
        self.name = name
        self.balance = balance

    def deposit(self, amount):

        if amount <= 0:
            return False

        self.balance += amount
        return True

    def withdraw(self, amount):

        if amount <= 0:
            return False

        if amount > self.balance:
            return False

        self.balance -= amount
        return True

    def get_balance(self):
        return self.balance


class SavingsAccount(BankAccount):

    def __init__(self, name, balance=0):
        super().__init__(name, balance)


class CurrentAccount(BankAccount):

    def __init__(self, name, balance=0):
        super().__init__(name, balance)