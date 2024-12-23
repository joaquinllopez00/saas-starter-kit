start-postgres:
	docker-compose up -d

stop-postgres:
	docker-compose stop

clean-postgres:
	docker-compose down -v
