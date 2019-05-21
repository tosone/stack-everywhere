include .env
export $(shell sed 's/=.*//' .env)

app_name                = stack
docker_name             = $(app_name)
docker_tag              = dev
docker_container        = $(app_name)

.PHONY: upgrade
upgrade:
	docker pull node:lts-alpine

.PHONY: build
build:
	docker build -t $(docker_name):$(docker_tag) .

.PHONY: run
run:
	docker-compose up --force-recreate -d $(docker_name)

.PHONY: exec
exec:
	docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -it $(docker_container) /bin/sh
