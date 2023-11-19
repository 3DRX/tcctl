GUNICORN_CMD_ARGS="--bind=0.0.0.0:8080 --workers=4" gunicorn server:app
