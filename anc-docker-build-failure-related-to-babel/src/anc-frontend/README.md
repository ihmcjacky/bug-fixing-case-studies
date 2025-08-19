# Anywhere Node Controller (ANC)
Web version of ANM (aka ANC), which removes native Windows dependencies and allow user to reach the applications through web access.

- @author: Jacky LAM <ihmcjacky@gmail.com>


## 1.1 Setup prerequisite environment

The following packages are required
| Package Name    | Version |
| -------- | ------- |
| NodeJS  | v18.20.8   |
| NPM  | v10.8.2   |
| docker  | latest version possible  |
| docker compose  | v2 or above  |

   
## 1.1.2 Setup development environment

Skip this section and go to section 1.1.3 if you are not developing the anc-frontend project

1. Install all packages mentioned in [section 1.1](#11-setup-prerequisite-environment)
2. Clone the frontend project using your repository URL (example): `git clone https://github.com/YOUR_ORG/YOUR_REPO.git`
3. Navigate to `<project_root>/client`
4. Run `npm install`
5. Run `npm run start`
6. Perform `p2_controller` web version setup (tutorial in p2_controller section)
7. Navigate `[http](http://localhost:<PORT>)` where `PORT` is the one you configured in [section 1.1.4](#114-configurable-items)

For developers, you can start developing in the repository.

If there are user right error, make sure to change the owner of the project folder to the user you are using (not root), and re-do the whole process

## 1.1.3 Setup QA environment

Go to section 1.1.2 if you are developing the anc-frontend project

1. Install all packages mentioned in [section 1.1](#11-setup-prerequisite-environment)
2. Clone the anc-frontend docker image by (TBD)
3. Perform `p2_controller` web version setup (tutorial in p2_controller section) (Optional if you already have set it up)
4. Navigate to `[http](http://<YOUR_HOST_IP>:3000/<PORT>)`
   - You can modify the access port by updating `/.env` and update the port value (Do not change the keywords, only port number changes)
5. Use `p2wtadmin` as the password for the user login

## 1.1.4 Configurable items
You can adjust the values in `.env` file to suit your needs
- `PORT`: The frontend port you would like to access the web interface. Modifying this configuration needs `stop`and `run` the containers again to apply)
- REACT_APP_FRONTEND_PORT: The port which anc-frontend used to communicate with p2_controller (a.k.a backend), **this port settings should match with the one in `p2_controller`'s `DJANGO_WEB_PORT` settings in its corresponding `.env` file, however it usually stay with port 80. (Note: modifying this settings needs `stop`, `rebuild` and `run` the containers again to apply**)
- REACT_APP_FRONTEND_HOSTNAME: The IP where you want to access the anc user interface in web browser, usually this is the host IP. (Note: modifying this settings needs `stop`, `rebuild` and `run` the containers again to apply)

After modifying the above settings, you need to run the following to restart the containers for reflecting changes

`docker compose -f ./docker-compose.yml up`  (assume you are in project directory)

## 1.1.5 Useful commands
- If any of the containers are not running as expected, or you mess up the containers, you can run the following command to remove all the containers and start again
  - `docker stop $(docker ps -aq)` : This command stops all the running containers and return your state to its original (no container running)
- `docker compose -f ./docker-compose-prod.yml up` : Start the containers
- `docker compose -f ./docker-compose-prod.yml down` : Stop the containers
- `docker compose -f ./docker-compose-prod.yml build` : Rebuild the containers (Note: you need to stop the containers first before rebuilding)