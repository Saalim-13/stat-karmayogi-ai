"""One-time local Admin provisioning. Never expose this through public signup."""

from __future__ import annotations

import argparse

from app.core.database import initialize_database
from app.core.security import hash_password
from app.repositories import learner_repository


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Stat-Karmayogi local Admin account")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    if len(args.password) < 10:
        raise SystemExit("Password must have at least 10 characters.")
    initialize_database()
    user = learner_repository.create_identity(args.name, args.email, "admin", hash_password(args.password), "en")
    print(f"Created admin: {user['email']}")


if __name__ == "__main__":
    main()
