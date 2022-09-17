# Installing Development Environments

## Getting Started

The HAPI International Patient Summary (IPS) Reference Implementation Server code has been performed in a way that source code changes may eventually be merged based into the core HAPI code base. As a consequence, code developed has been performed on a fork of the open-source HAPI repository. The running implementation of the HAPI server, however, is a JPA implementation of HAPI using a [PostgreSQL](https://www.postgresql.org/) database. 

The following development environment setup assumes an Ubuntu (22) operatiing system on a cloud (i.e. AWS for clarity here) with internet access to various packages. 

### Server Selection

It is recommended to use server with a good amount of compute power and RAM to compile the HAPI code based efficiently (even when not running all tests). The server used in our system is

- [c5.2xlarge](https://aws.amazon.com/ec2/instance-types/c5/) vCPU = 8, 16Gb RAM
- Operating System is [Ubuntu](https://ubuntu.com/) 22.04

Make sure the relevant ports are opened in your VPC (e.g. 80 and 443 for HTTP/HTTPS respectively. 8080 for test/development) and that the storage is available for your planned usage (30Gb used in our example).  

### Server Setup

Update apt-get

`sudo apt update`

Install Java Development Kit (version 17)

`sudo apt install -y openjdk-17-jdk`

Check java version

`java -version`

Install Maven packages for development

`sudo apt install maven -y`

Install PostgreSQL

`sudo apt install -y postgresql postgresql-contrib`

Find where postgresql is installed and navigate to folder

`cd /etc/postgresql/14/main/`
`sudo nano pg_hba.conf`

Within this file, change the second entry (all user) from `peer` to `md5`

Launch PostgreSQL

`sudo -i -u postgres`

Create a user 

`createuser --interactive`

Create a database

`createdb fhir`

Access database

`psql`

Change user password

`\password [USERNAME YOU CREATED]`

Leave postgres

`\q`

`exit`

Test database access

`psql -d fhir -U [USERNAME YOU CREATED]`

`\q`

Go to home folder (or somewhere else if you prefer to change)

`cd ~`

Check that git is installed

`git --version`

### Respository Cloning

Clone both the HAPI Server and the JPA starter. Make sure that both of these directories are equivalent in the folder hierarchy since the local deployment builds across the folders 

`git clone https://github.com/CrossroadsLabs/hapi-fhir`
`git clone https://github.com/CrossroadsLabs/hapi-fhir-jpaserver-starter`

### JPA Configuration

Get started with setup for postgresql 

`cd hapi-fhir-jpaserver-starter`
`sudo nano ./src/main/resources/application.yaml`

Edit the YAML application file in the two following section

[MAY CHANGE BASED ON TRANSITION TO ENV VARIABLES]
datasource:
  url: 'jdbc:postgresql://localhost:5432/fhir'
  username: 
  password: 
  driverClassName: org.postgresql.Driver
  platform: postgres

tests: 
  name: Local Tester
  server_address:
  refuse _toFetch_third_party_urls: false
  fhir_version: R4

Check that JPA server can start

`sudo mvn clean package spring-boot:repackage -Pboot && java -jar target/ROOT.war`

You should now be able to hit the server on 8080 (default port). We suggest to install nginx for reverse proxy for HTTP/HTTPS. Some general but reasonable [instructions](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-web-server-and-reverse-proxy-for-apache-on-one-ubuntu-18-04-server) to get started.

Only the second command is needed to start server without rebuilds. 

## Working with Code and Building

### FHIR R4 Server Base & Approach to Builds

The IPS Reference Implementation Server is an adaptation of the [HAPI FHIR Server](https://hapifhir.io/). HAPI is an open-source Java based platform for FHIR servers and adopted in many nations globally. General documentation on the HAPI sever is [available](https://hapifhir.io/hapi-fhir/docs/) for the [open-source HAPI repository](https://github.com/hapifhir/hapi-fhir).


### Editing the code

The main code changes for the server are currently under the branch  

`cd ~`
`cd hapi-fhir` 
`git checkout rb_ips`
`src/main/java/ca/uhn/fhir/jpa/provider/r4/patient`

PatientSummary.java is the main file for the summary generation

### Building a new deploy

To build the HAPI instance using a local deployment strategy

`cd ~`
`cd hapi-fhir` 

After you complete changes, this command will deploy JAR/WAR files to target folder in ~/hapi-fhir-jpaserver-starter

`sudo mvn clean deploy -DskipTests`

Then you will need to rebuild the environment

`sudo mvn clean package spring-boot:repackage -Pboot && java -jar target/ROOT.war`

Good luck hacking! 
