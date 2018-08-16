#!/usr/bin/env bash
## .env loading in the shell
#dotenv () {
#  set -a
#  [ -f .env ] && . .env
#  set +a
#}
#
## Run dotenv on login
#dotenv
echo "Enter your host name in format: yourname.mbst.xyz "
read domain
echo "Enter your project Mobsted path to mobsted folder (which contains boiler, bots..): ${PROJECT_PATH}"
read project_path



if   grep -q -i "release 7" /etc/redhat-release ; then
  sed -i "s@defaultprojectpath@${project_path}@g" .env

else
  sed -i '' "s@defaultprojectpath@${project_path}@g" .env
fi



mkdir -p logs/nginx
chmod -R 777 logs

docker-compose up -d
./docker-gets-ssl.sh ${domain}

if  grep -q -i "release 7" /etc/redhat-release ; then

sed -i "s@defaultstartupkeys@${domain}@g" ./conf/nginx/conf.nginx
sed -i "s@defaultstartupkeys@${domain}@g" .env

else

sed -i '' "s@defaultstartupkeys@${domain}@g" ./conf/nginx/conf.nginx
sed -i '' "s@defaultstartupkeys@${domain}@g" .env
fi

docker-compose down
docker-compose up -d



