#!/bin/bash

path=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
path=$(realpath  "$path/../")






apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list
apt update 

# Change mongoDB Listening IP Address from local 127.0.0.1 to All IPs 0.0.0.0
# sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g' /etc/mongod.conf


# https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install -y nodejs nginx mongodb-org
systemctl enable mongod.service
#systemctl enable nginx.service

service mongod start


node -v
npm install -g bower
systemctl start nginx

mkdir $path/logs

echo "
upstream node_server {
    server 127.0.0.1:8080;
    keepalive 15;
}

server {
	listen 80;
    root $path/dist/client;
	index index.html index.htm;
	error_page 404 index.html;

	access_log off;
	error_log  $path/logs/site-error.log;

	server_name site.com www.site.com;

	large_client_header_buffers 8 32k;

	location /api {
	    try_files \$uri @nodejs;
	}
    


	location /socket.io-client/ {
        proxy_pass http://node_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_redirect off;

        proxy_buffers 8 32k;
        proxy_buffer_size 64k;

        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
	}

	location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
	    expires 30d;
	}

    location / {
        
        try_files \$uri \$uri/ /index.html =404;
    }


	location @nodejs {
	    proxy_pass http://node_server;
	}

	location ~ /\. {
		deny all;
	}

    #error_page 404 /index.html;
}

" > $path/247buddy

echo "
gzip_proxied any;
gzip_types text/plain text/xml text/css application/x-javascript;
gzip_vary on;
gzip_disable \"MSIE [1-6]\.(?!.*SV1)\";
" > /etc/nginx/conf.d/gzip.conf


rm -f /etc/nginx/{sites-available,sites-enabled}/{247buddy,default}
ln -s $path/247buddy /etc/nginx/sites-available/247buddy
ln -s $path/247buddy /etc/nginx/sites-enabled/247buddy

mkdir -p $path/dist/client/uploads
source   $path/utils/mongo_uri.sh
mongo $MONGO_DB --eval "db.createUser({user: '$MONGO_USER',pwd: '$MONGO_PASS',roles: [ { role: 'userAdmin', db: '$MONGO_DB' } ]})"
