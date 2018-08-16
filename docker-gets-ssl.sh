#docker run -it --rm --name certbot \
#  -v /conf/letsencrypt:/etc/letsencrypt \
#  -v /logs/letsencrypt:/var/log/letsencrypt \
#  -v /mobsted/boiler/www:/var/www/.well-known \
#  certbot/certbot -t certonly \
#  --agree-tos --renew-by-default \
#  --webroot -w /var/www \
#  -d docker.mobsted.com
# use: docker-gets-ssl.sh docker.mobsted.com where docker.mobsted.com uis host name

docker run -it --rm --name mbst-certbot -v $(pwd)/conf/letsencrypt:/etc/letsencrypt -v $(pwd)/logs/letsencrypt:/var/log/letsencrypt -v $(pwd)/conf/ssl/data:/var/www certbot/certbot certonly --agree-tos --renew-by-default --webroot -w /var/www -d $1
