#!/bin/bash
PIDS=$(pgrep -f "gunicorn server:tcctl_server")
if [ -z "$PIDS" ]; then
    echo "tcctl is not currently running."
else
    for PID in $PIDS; do
        kill -TERM $PID
    done
    for PID in $PIDS; do
        while [ -e /proc/$PID ]; do
            sleep 1
        done
    done
    echo "Stopping tcctl..."
fi
