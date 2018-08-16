FROM keymetrics/pm2:latest-alpine

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn

COPY src src/
COPY src/package.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install


# Expose the listening port of your app
EXPOSE 9999-50000


# Show current folder structure in logs
#RUN ls -al -R
VOLUME /home/www/mobsted/bots
VOLUME /root/.pm2/logs/
ENTRYPOINT [ "pm2-runtime", "start" ]
#ENTRYPOINT ["/entrypoint.sh"]
