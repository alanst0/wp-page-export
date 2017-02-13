#!/bin/sh
cd $(dirname "$0")
docker run \
    --name nginx-wp-print-tool \
    -p 8000:80 \
    -v "$(pwd)/web":/usr/share/nginx/html:ro \
    -v "$(pwd)"/nginx/nginx.conf:/etc/nginx/conf:ro \
    -d nginx
