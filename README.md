# viber-bot-in-docker
Starting Viber-bot with pm2 with docker containers

The problem: when I start viber-bot on the host machine it works like a charm.
Bot is exposed to port 10022 and accessible at https://denis.mbst.xyz:10022
But we cant expose all ports, so we hide viber-bot behind nginx.
we're proxying requests from https://denis.mbst.xyz/bot/10022 to local container running on 10022 port
But when pm2 launcher is inside docker and host for viber is proxied behind nginx
it fails to set up viber webhoook.

## how to reproduce
### 1. Build local images
```bash
cd /images/nginx
./build.sh
cd /images/bots/viberhost
./build.sh
```

```bash
cd images/bots/viberhost/src
npm i
docker-compose up
```

### How it's done
We're going to run multiple bots inside docker. For the sake of security,
only nginx is exposed at 80 and 443 ports.
But every bot must run on it's own port, so we did the trick when
we're proxying requests from https://some.com/bot/10022 to local container running on 10022 port
Here's line fron ngnix.conf
```nginx
location ~/bot/(1[0-9][0-9][0-9][0-9]).
        {
            resolver 127.0.0.11;
            proxy_pass http://viberhost:$1;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_max_temp_file_size 0;
            proxy_redirect off;
            proxy_read_timeout 240s;
        }
```
Container with viber-bots runs
```bash
pm2 start ecosystem_test_viber.config.js 
```
