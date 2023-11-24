#!/bin/bash
export GUNICORN_CMD_ARGS="--bind=0.0.0.0:8080 --workers=1"
nohup gunicorn server:tcctl_server > tcctl.log 2>&1 &
