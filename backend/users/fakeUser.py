import random
from faker import Faker
from django.contrib.auth.models import User
 
from django.db import IntegrityError
from django.utils import timezone

# 1. Initialize Faker
fake = Faker()

# 2. Define the number of users and the default password
NUM_USERS = 20
TEST_PASSWORD = 'password123' 

print(f"--- Creating {NUM_USERS} fake CustomUser objects... ---")

users_created = 0
for i in range(NUM_USERS):
    first_name = fake.first_name()
    last_name = fake.last_name()
    
    # Generate a unique email using first name, last name, and a unique number
    email = f"{first_name.lower()}.{last_name.lower()}{random.randint(100, 999)}@{fake.domain_name()}"
    
    # Randomly set some as staff/admin and active
    is_staff_status = random.choice([True, False, False]) # More likely to be regular users
    is_active_status = random.choice([True, True, True, False]) # Mostly active
    
    try:
        user = User.objects.create_user(
            email=email,
            password=TEST_PASSWORD,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff_status,
            is_active=is_active_status,
            date_joined=fake.date_time_between(start_date='-2y', end_date='now', tzinfo=timezone.utc)
        )
        users_created += 1
        print(f"Created: {user.email} (Staff: {user.is_staff})")
    
    except IntegrityError as e:
        # Skip if a unique constraint (like email) is somehow violated
        print(f"Skipped creation due to IntegrityError (duplicate): {e}")

print(f"--- Successfully created {users_created} users! ---")
print(f"Test Password for all is: {TEST_PASSWORD}")
# Remember to exit the shell when done
# exit()