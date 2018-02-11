Node.js v.9.5.0


1) Clone the git repository

2) Within the "incidents" folder, execute the command "docker-compose build"

3) When finished, run the command "docker-compose up"

4) When running the server, if the application can't connect to the database server, stop your servers and copy the host name specified by the mongo server (the text with the following format: "host=copy_this_text"), open your ./incidents/docker-compose.yml file and set the environment variable "INCIDENTS_DB_SERVER_NAME" to the specified host name and rerun your servers with "docker-compose up"

5) In your browser, navigate to "localhost:8000/incidents" to see it working!


PS: to run the tests, go to the ./incidents/dev/ folder and execute "npm test"
