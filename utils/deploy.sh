#!/bin/bash

git pull
# npm install 
# bower install  --allow-root

if [ -z "$1" ]
  then
    gulp build
fi

export NODE_ENV=production
export SKIP_ASSETS=true

path=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
path=$(realpath  "$path/../")

#source   $path/mongo_uri.sh

#PATH=$PATH:$path/node_modules/pm2/bin/



pm2 stop all
pm2 delete all
pm2 kill all
pm2 start $path/dist/server/app.js --name 247buddy  -o $path/logs/node_out.log -e $path/logs/node_err.log

echo "
   Please  restart nginx 
   sudo systemctl restart nginx
"


systemctl restart nginx
# service mongod start

# chmod g+x /root && chmod g+x /root/247buddy && chmod g+x /root/247buddy/dist/client