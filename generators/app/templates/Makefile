.PHONY: up down destroy artisan log network

# Set dir of Makefile to a variable to use later
MAKEPATH := $(abspath $(lastword $(MAKEFILE_LIST)))
PWD := $(dir $(MAKEPATH))

up:
	docker-compose up -d

down:
	docker-compose stop

destroy:
	docker network disconnect <%= docker.networkName %> nginx
	docker-compose down

network:
	docker network connect <%= docker.networkName %> nginx
	docker-compose stop
	docker-compose up -d

artisan:
	docker exec -it <%= docker.phpContainer %> bash

log:
	tail -f $(PWD)storage/logs/laravel.log | awk '\
		{matched=0}\
		/INFO:/    {matched=1; print "\033[0;37m" $$0 "\033[0m"}\
		/WARNING:/ {matched=1; print "\033[0;34m" $$0 "\033[0m"}\
		/ERROR:/   {matched=1; print "\033[0;31m" $$0 "\033[0m"}\
		/Next/     {matched=1; print "\033[0;31m" $$0 "\033[0m"}\
		/ALERT:/   {matched=1; print "\033[0;35m" $$0 "\033[0m"}\
		/Stack trace:/ {matched=1; print "\033[0;35m" $$0 "\033[0m"}\
		matched==0            {print "\033[0;33m" $$0 "\033[0m"}\
	'