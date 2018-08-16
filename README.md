# viber-bot-in-docker
Starting Viber-bot with pm2 with docker containers.

The problem: when I start viber-bot on the host machine it works like a charm.
Bot is exposed to port 10022 and accessible at https://denis.mbst.xyz:10022. 
The code is at images/bots/viberhost/src/viber/MobstedViberBot.js: 49. You can even take source code to run from
https://developers.viber.com/docs/api/nodejs-bot-api/

```javascript
 viberListenerServer.createServer(this.miniapp.middleware()).listen(params['port'], () => {
      that.miniapp.setWebhook(webhookurl).catch(function (e) {
        console.warn('NO WEBHOOK SET! Problem IS HERE!')
        console.log(e);
      });
    });
```


**But we cant expose all ports, so we hide viber-bot behind nginx.**
We're running nginx on host denis.mbst.xyz.
We're proxying requests from https://denis.mbst.xyz/bot/10022 to local container running on 10022 port

But when pm2  launcher (https://pm2.io/doc/en/runtime/integration/docker/) is inside docker and host for viber-bot is proxied behind nginx - it fails to set up viber webhoook. **But! At the same time:  Viber-bot is avaialble from outside! On that url!**

You can GET/POST https://denis.mbst.xyz/bot/10022 and see in viberhost logs that it does some logging. So the request is reaching it.
Check logs at `logs/pm2` folder.
But in that same moment, nginx in `logs/nginx` says that he gets a 404 error message (Wtf?!)
```log
172.27.0.1 - - [14/Aug/2018:06:12:44 +0000] "POST /bot/20000?sig=f985f3f4b20a9f67e8c4b1849dee6346845dd3c2916f86b8f68a96c418440eef HTTP/1.1" 404 149 "-" "Jetty/9.2.10.v20150310" "-" "{\x22event\x22:\x22webhook\x22,\x22timestamp\x22:1534227163635,\x22message_token\x22:5210036030700670331}" "-" "-" "-" "-"

```
 And viber-bot is GETTING(!) request from viber server, can see it, but reports that setting webhook failed.

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
pm2 start ecosystem_test_viber.config.js --env=test
```
This config containg
###Problem!
 Please help to fix NGINX config, so it will alllow viber-bot to set up webhook. I think that the problem is with some Headers maybe, or 
 with some connection problem between Viber.com - Nginx -Viber-bot...
 Please feel free to comment out this situation.
 
