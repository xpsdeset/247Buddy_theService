#!/bin/bash

path=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
path=$(realpath  "$path/../")


yum update -y
echo "
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
" > /etc/yum.repos.d/mongodb-org-3.4.repo

yum repolist
yum install mongodb-org -y
systemctl start mongod
systemctl enable mongod



yum install -y epel-release
yum install -y nginx
systemctl start nginx
firewall-cmd --permanent --zone=public --add-service=http 
firewall-cmd --permanent --zone=public --add-service=https
firewall-cmd --reload

#systemctl enable nginx
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
yum install -y nodejs

yum install -y git lsof curl


mkdir -p $path/dist/client/uploads
mkdir $path/logs

npm install -g bower
npm install -g pm2
npm install -g node-gyp

git config credential.helper store



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

" > /etc/nginx/conf.d/247buddy.conf 

echo "
gzip_proxied any;
gzip_types text/plain text/xml text/css application/x-javascript;
gzip_vary on;
gzip_disable \"MSIE [1-6]\.(?!.*SV1)\";
" > /etc/nginx/conf.d/gzip.conf

# /etc/nginx/nginx.conf
# http block.
# include /etc/nginx/conf.d/*.conf;

source   $path/utils/mongo_uri.sh
mongo $MONGO_DB --eval "db.createUser({user: '$MONGO_USER',pwd: '$MONGO_PASS',roles: [ { role: 'userAdmin', db: '$MONGO_DB' } ]})"


#  sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=1024
#   sudo /sbin/mkswap /var/swap.1
#   sudo /sbin/swapon /var/swap.1