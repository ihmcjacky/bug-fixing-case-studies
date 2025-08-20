# Supreme AV Container Startup Ordering Issues

**Note: This is a sanitized version of the original case study, some sensitive information has been removed. Also only a partial of the source code has been included for demonstration purpose only.**

## Overview & Background
This case study documents container startup failure when initializing the whole supremeav system. Detailed log shows `ECONNREFUSED errors related to the "supremeav-server" container`.

## Symptoms
When starting up the supremeav system using `docker-compose up`, the `supremeav-server` container fails to start up and throws `ECONNREFUSED` errors. The errors indicate that the server is unable to connect to the MongoDB database.

The interesting part is it happens **intermittently**. Sometimes it works fine, sometimes it doesn't. And it is not deterministic, meaning there is no clear pattern to reproduce the issue. 

## Diagnosis
The failed container is a nodeJS powered backend server serving common API requests's responses, authentication, database operation etc. Judging from the error message `ECONNREFUSED`, it is clear that the server is unable to connect to the MongoDB database. 

First I used `docker-compose -f ./docker-compose.yml ls` and `docker ps -a` making sure all containers are in Exited (0) state.

Next, I tested whether both containers are under the same network, by running `docker inspect <network_name> --format '{{.NetworkSettings.Networks}}` and verify both containers are attached to the same network.

The next logical step would be the dependency ordering configured in docker compose file. The `supremeav-server` container should depends on the `mongodb` container, but originally it only detects whether the `mongodb` container is started, not whether it is healthy. 

```yaml
supremeav-server:
    image: supremeav
    container_name: supremeav-server
    build:
        context: ./backend/
        args:
            NODE_ENV: ${NODE_ENV}
    volumes:
        - ./backend:/usr/src/app
        - /usr/src/app/node_modules
        - ./debug:/var/log
    depends_on:
        mongodb:
            condition: service_started
    ports:
    ...
```

It clearly is not enough for just waiting for the container to start, as the database may not be ready to accept connections yet. Therefore, we need to add a health check to the `mongodb` container to ensure it is really up and running before starting the `supremeav-server` container.

## Resolution
Add a health check to the `mongodb` container to ensure it is really up and running before starting the `supremeav-server` container. The only left considering would be what health check command to use.

```yaml
mongodb:
    image: mongo:4.4.2
    container_name: supremeav-db
    ports:
        - "${DB_PORT_HOST}:${DB_PORT_CONTAINER}"
    expose:
        - ${DB_PORT_HOST}
    environment:
        MONGO_INITDB_ROOT_USERNAME: root
        MONGO_INITDB_ROOT_PASSWORD: DATABASE_PASSWORD
        MONGO_INITDB_DATABASE: supremeav-db
    volumes: 
        - ./dbdata:/data/db
    healthcheck:
        test: ["CMD", "mongo", "--quiet", "--eval", "db.runCommand('ping').ok"]
        interval: 10s
        timeout: 5s
        retries: 5
        start_period: 30s
```

From the above, we use `mongo` command to connect to the database and run a simple ping command to check whether the database is up and running. The `--quiet` option is used to suppress the output of the command, and `--eval` option is used to run the JavaScript code `db.runCommand('ping').ok` to check whether the database is up and running. The `ok` field in the response is `1` if the database is up and running, and `0` otherwise.

After the addition of health check, the `supremeav-server` container is configured to wait for the `mongodb` container to be healthy before starting up. This resolves the issue of intermittent startup failure.

Below is the logs of successful startup of the fixed supremeav-server container.

**Command**
```bash
docker logs --tail 10 supremeav-server
```

**Output**
```bash
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node mongoEngine.js`
(node:21) DeprecationWarning: `open()` is deprecated in mongoose >= 4.11.0, use `openUri()` instead, or set
t the `useMongoClient` option if using `connect()` or `createConnection()`. See http://mongoosejs.com/docs/4
4.x/docs/connections.html#use-mongo-client
(Use `node --trace-deprecation ...` to show where the warning was created)
Server ready, listening incoming request on port 3002...
Db.prototype.authenticate method will no longer be available in the next major release 3.x as MongoDB 3.6 w
will only allow auth against users in the admin db and will no longer allow multiple credentials on a socket
t. Please authenticate using MongoClient.connect with auth credentials.
database connected!!
(node:21) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug i
in your own promise library instead: http://mongoosejs.com/docs/promises.html
counter initialized
Admin created successfully!
```