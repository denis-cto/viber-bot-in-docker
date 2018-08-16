FROM keymetrics/pm2:latest-alpine

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN set -x \
&& echo "Starting DOCKER image with PM2" \
    && npm i \
    && ls -la \
    && pwd;


# Expose the listening port of your app
EXPOSE 9999-50000


# Show current folder structure in logs
#RUN ls -al -R
VOLUME /home/www/mobsted/bots
VOLUME /root/.pm2/logs/
ENTRYPOINT [ "pm2-runtime", "start" ]
#ENTRYPOINT ["/entrypoint.sh"]
