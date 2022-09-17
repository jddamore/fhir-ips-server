## Installing HAPI IPS Server

### Target Directory

The server is setup to run as a HAPI JPA H

### Starting the Server

If everything's installed and compiled, you can start server using with terminal output using 

`sudo java -jar target/ROOT.war`

If you would like to have the server continue running after terminal hangup, use the following command:

`sudo nohup java -jar target/ROOT.war &`

### Checking Ports 

If you run into a conflict on what's running on ports, run the following command to see port usage:

`sudo netstat -tulpn`

### 