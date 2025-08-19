#======================================================================
# Docker client base image which is used as foundation
FROM node:22.17.1 as app_base
WORKDIR /usr/src/app

# Install dependencies (including SSH client)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    git \
    net-tools \
    iputils-ping \
    dnsutils \
    traceroute
# NOTE: SSH setup removed for public repository sanitization.
# If private dependencies are required, use HTTPS with access tokens or Docker build secrets.

# copy package.json and package-lock.json to Docker environment
COPY client/package*.json ./
# Installs all node packages
RUN npm install --include=dev

#======================================================================
# Docker image build for create react app (web based docker)
FROM app_base AS app_prod_build
WORKDIR /usr/src/app
COPY ./client/ .

ARG REACT_APP_FRONTEND_HOSTNAME
ENV REACT_APP_FRONTEND_HOSTNAME=$REACT_APP_FRONTEND_HOSTNAME
ARG REACT_APP_FRONTEND_PORT
ENV REACT_APP_FRONTEND_PORT=$REACT_APP_FRONTEND_PORT

RUN npm run build
# Add build timestamp to force cache invalidation
RUN node post-build.js

#======================================================================
# Production server to serve the built React app files
FROM app_prod_build AS prod_serve
WORKDIR /usr/src/app
RUN npm install -g serve
# Copy serve configuration
COPY client/serve.json ./