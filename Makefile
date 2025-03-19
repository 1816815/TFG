-include .env

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose build backend

migrate:
	docker exec -it ${APP_NAME}_backend python manage.py makemigrations
	docker exec -it ${APP_NAME}_backend python manage.py migrate

back_terminal:
	docker exec -it ${APP_NAME}_backend bash

front_terminal:
	docker exec -it ${APP_NAME}_frontend bash

logs:
	docker compose logs -f