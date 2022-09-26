## Installing HAPI IPS Server

This is a general guide for setting up a hosting instance that does not attempt to build the code. This uses the JPA HAPI server framework with a Postgresql backend 

### Dependencies

See the dev server for setup for JDK, Maven and Postgresql. Nginx setup detailed below. 

- JDK 17
- Maven
- Postgresql
- Nginx (for reverse proxy, see section below for setup)

### Target Directory

The server is setup to run as a HAPI JPA Server. You can copy the WAR and JAR files produced from the hapi-fhir edited branch into the target directory. Alternatively you can change your deploy sequence to incorporation in hapi-fhir

### Open up firewall ports

The AWS instance security group must allow relevant ports to be opened. This is generally 80(HTTP) and 443 (HTTPS) but possibly also 8080 (direct HAPI access). In addition the local firewal should be open as well: 

Check firewall status

`` sudo ufw status ``

Start if inactive

`` sudo ufw allow 22 ``
`` sudo ufw enable ``

Open desired ports. Last command is optional based on whether you want bypass of Nginx open
`` sudo ufw allow 80 ``
`` sudo ufw allow 443 ``
`` sudo ufw allow 8080 ``

### Reverse Proxy Setup (Ngnix)

Install nginx

``sudo apt-get install nginx``

Setup default sites-enabled

``cd /etc/nginx/sites-enabled``

``sudo nano default``

Paste the following below. Note that the SSL key and certificate path will need to be adjusted to location on server. In addition, certicate bundle should be concatenated. 

```
server {
   listen 80;
   server_name ips.health;
   return 301 https://ips.health$request_uri;
}
```

```
server {
listen 443 ssl;
ssl_certificate  /home/ubuntu/ssl-bundle.crt;
ssl_certificate_key  /home/ubuntu/ips.health.key;
ssl_prefer_server_ciphers on;
server_name ips.health;
location / {
proxy_pass http://localhost:8080;
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
}
}
```

Check the Nginx configuration

``sudo service nginx configtest``

If it says ok, restart Nginx

``sudo service nginx restart`` 

### Server Customization

The following defaults have been changed on the standard HAPI JPA server: 

- DaoConfig to use UUID strategy for id
- Logo of the HAPI server
- Description of the HAPI server

### Starting the Server

If everything's installed and compiled, you can start server using with terminal output using 

`sudo java -jar target/ROOT.war`

If you would like to have the server continue running after terminal hangup, use the following command:

`sudo nohup java -jar target/ROOT.war &`

### Checking Ports 

If you run into a conflict on what's running on ports, run the following command to see port usage:

`sudo netstat -tulpn`

