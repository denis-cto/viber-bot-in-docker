# viber-bot-in-docker
Starting Viber-bot with pm2 with docker containers

The problem: when I start viber-bot on the host machine it works like a charm.
But when pm2 launcher is inside docker and host for viber is proxied behind nginx
it fails to set up viber webhoook.

## how to reproduce
```bash
cd images/bots/viberhost/src
npm i
docker-compose up
```
