import os
import sys
import random
from faker import Faker

# Make this file runnable directly (outside manage.py) by configuring Django
# Ensure the project root (parent directory) is on sys.path so the project
# package (settings module) can be imported when running `py users/fakeuser.py`.
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Point to the Django settings module and initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

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
        # Create a timezone-aware datetime for date_joined
        try:
            tz = timezone.get_current_timezone()
        except Exception:
            # Fallback to UTC
            from datetime import timezone as _dt_timezone
            tz = _dt_timezone.utc

        naive_dt = fake.date_time_between(start_date='-2y', end_date='now')
        try:
            aware_dt = timezone.make_aware(naive_dt, tz)
        except Exception:
            # If django's make_aware is not suitable for tz (e.g., tz is datetime.timezone.utc),
            # fallback to replacing tzinfo directly
            aware_dt = naive_dt.replace(tzinfo=tz)

        # Many user models require a username; derive one from the email local-part
        local_part = email.split('@', 1)[0]
        username = f"{local_part}{random.randint(10,9999)}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=TEST_PASSWORD,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff_status,
            is_active=is_active_status,
            date_joined=aware_dt
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