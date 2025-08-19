#======================================================================
# Docker client base image which is used as foundation
FROM node:18.12.1 as client_base
WORKDIR /usr/src/app
# copy package.json and package-lock.json to Docker environment
COPY client/package*.json ./
# Installs all node packages
RUN npm install

#======================================================================
# Docker image build for create react app (web based docker)
FROM client_base as prod_build
WORKDIR /usr/src/app
RUN npm run build

#======================================================================
# Nginx image to serve the built React app files
FROM nginx:1.21.6-alpine
WORKDIR /usr/share/nginx/html
COPY --from=prod_build /usr/src/app/build ./
EXPOSE 80
CMD ["nginx", "-t"]

#======================================================================
# Docker client base image which is used as foundation
# FROM node:12.18-slim as server_base
# # SET DEFAULT ARG
# ARG API_SERVER_URL=localhost
# ARG UI_DISPLAY_VER=v1.5.999
# ARG AOS_SUPPORTED_VER=v1.4.161
# ARG NTP_SERVER_VER=999
# ARG CM_VER=999
# ARG CA_VER=999
# # ASSIGN ARG TO ENV
# ENV API_SERVER_URL=$API_SERVER_URL \
#     UI_DISPLAY_VER=$UI_DISPLAY_VER \
#     AOS_SUPPORTED_VER=$AOS_SUPPORTED_VER \
#     NTP_SERVER_VER=$NTP_SERVER_VER \
#     CM_VER=$CM_VER \
#     CA_VER=$CA_VER
# WORKDIR /usr/src/server
# # copy package.json and package-lock.json to Docker environment
# COPY server/package*.json ./
# # Copies everything frin host machine to Docker environment
# COPY server/. .
#======================================================================
# Docker server dev Image
# FROM server_base as server_dev
# # Installs all node packages
# RUN npm install
# # epose port for the dev server
# EXPOSE 5000
# # run webpack-dev-server
# CMD [ "npm", "run", "dev" ]
#======================================================================
# Docker client dev Image
FROM client_base as client_dev
# Copies everything from host machine to Docker environment
COPY client/. ./
# Copy readme.md
COPY ./README.md ./
# expose port for the dev server
EXPOSE 3000
# run webpack-dev-server
CMD [ "npm", "start" ]

#======================================================================
# Docker client prod image for build react app
FROM client_dev as client_prod_builder
# SET DEFAULT ARG
ARG UI_DISPLAY_VER=Production
# ASSIGN ARG TO ENV
ENV REACT_APP_UI_DISPLAY_VER=$UI_DISPLAY_VER
#==========NWOnly==========
RUN dpkg --add-architecture i386 && \
apt-get update && \
apt-get install -y wine wine32 zip unzip && \
apt-get install -y jq
# Build NW apps
RUN npm run nw-build -- ui-version=${UI_DISPLAY_VER}

#======================================================================
# Docker client prod image for build react app
FROM client_prod_builder as client_prod_oem_builder
# SET DEFAULT ARG
ARG UI_DISPLAY_VER=Production
# ASSIGN ARG TO ENV
ENV REACT_APP_UI_DISPLAY_VER=$UI_DISPLAY_VER
# OEM related files move before application build
RUN cp -pvrf ./build_config/oem/prod-settings.json ./build_config/prod-settings.json && \
    cp -pvrf ./build_config/oem/sdk-settings.json ./build_config/sdk-settings.json
RUN cp -pvrf ./build_config/oem/favicon.ico ./public/favicon.ico && \
    cp -pvrf ./build_config/oem/favicon.png ./public/favicon.png && \
    cp -pvrf ./build_config/oem/logo192.png ./public/logo192.png && \
    cp -pvrf ./build_config/oem/logo512.png ./public/logo512.png
# Build OEM NW apps
RUN npm run nw-build -- ui-version=${UI_DISPLAY_VER} oem=1

#==========NWOnly==========
# run build
# RUN npm run build
# #======================================================================
# # Docker client prod image for hosting build file
# FROM server_base as client_prod
# # Installs all node packages for production only
# RUN npm install --production
# # copy build file from dev to nginx
# COPY --from=client_prod_builder /usr/src/app/build /usr/src/server/build
# # expose port static server
# EXPOSE 80
# # run webpack-dev-server
# CMD [ "npm", "run", "prod" ]
#======================================================================
