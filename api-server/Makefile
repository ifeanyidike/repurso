# Variables
DB_URL=postgres://ifeanyidike:frosty@postgres/repursodb?sslmode=disable
MIGRATIONS_DIR=./cmd/migrate/migrations
NETWORK=77802057761a
MIGRATE_CMD=docker run --rm --network=${NETWORK} -v $(shell pwd)/cmd/migrate/migrations:/migrations migrate/migrate 

# Targets
.PHONY: all up down create init-db

all: up

# Run migrations up
up:
	$(MIGRATE_CMD) -path=/migrations -database=$(DB_URL) -verbose up

# Run migrations down
down:
	$(MIGRATE_CMD) -path=/migrations -database=$(DB_URL) -verbose down -all

clean:
	$(MIGRATE_CMD) -path=/migrations -database=$(DB_URL)  force 1

# Create a new migration file
# Usage: make create name=your_migration_name
create:
	@echo "Creating migration file: $(MIGRATIONS_DIR)/$(name)"
	mkdir -p $(MIGRATIONS_DIR)
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)

# Initialize the database (optional custom logic)
init-db:
	@echo "Initializing the database..."
	PGPASSWORD=frosty psql -h localhost -U ifeanyidike -d repursodb -f ./scripts/init_db.sql
