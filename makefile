HOST_HOSTNAME=$(shell hostname)
#HOST_HOSTNAME=localhost

all: update-env up

update-env:
	@echo "Updating HOST_HOSTNAME in .env file..."
	@sed -i -e 's/^HOST_HOSTNAME.*/HOST_HOSTNAME=$(HOST_HOSTNAME)/g' .env

up:
	docker compose up
down:
	docker compose down
re: down all