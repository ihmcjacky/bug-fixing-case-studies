# A-NC On-Premises Container Building Error Related to Babel

**Note: This is a sanitized version of the original case study, some sensitive information has been removed. Also only a partial of the source code has been included for demonstration purpose only.**

## Overview & Background
This case study documents the issue encountered when building the Anywhere Node Controller (A-NC) on-premises container, which is related to Babel. The purpose of this study is to provide a detailed analysis of the problem, the steps taken to resolve it, and the lessons learned from the experience.

A little background of the project, the A-NC is a web application act as a successor of our company's core product Anywhere Node Manager (A-NM), A-NM is a Windows based application focus on provisioning of our mesh network nodes formed network, providing comprehensive mesh network management, configuration and monitoring. 

A-NC takes a further step to containerized as a docker based application, accessible through browser, as a replacement of the A-NM, providing a more ease to access in terms of user interface, and better scalability and maintainability in terms of our improved underlying on-premises or even cloud infrastructure.

## Problem Description
During the process of containerizing the A-NC on-premises application, I made use of `docker-compose-prod.yml` to build the container, this yml file is used to build the production image of the A-NC, and it is based on `wProd.Dockerfile`. The build process is success when I build it in host machine, however, when I try to build it through our company's CI/CD pipeline, the following error occurred:

```
user@host:~/project$ docker compose -f ./docker-compose-prod.yml build
WARN[0000] /home/jacky/Documents/gitproj/anc-frontend/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
Compose can now delegate builds to bake for better performance.
 To do so, set COMPOSE_BAKE=true.
[+] Building 562.6s (16/16) FINISHED                                                                                                                                           docker:default
 => [anm_ui internal] load build definition from wProd.Dockerfile                                                                                                                        0.0s
 => => transferring dockerfile: 1.43kB                                                                                                                                                   0.0s
 => WARN: FromAsCasing: 'as' and 'FROM' keywords' casing do not match (line 3)                                                                                                           0.0s
 => [anm_ui internal] load metadata for docker.io/library/node:22.17.1                                                                                                                   0.4s
 => [anm_ui internal] load .dockerignore                                                                                                                                                 0.0s
 => => transferring context: 153B                                                                                                                                                        0.0s
 => [anm_ui client_base 1/8] FROM docker.io/library/node:22.17.1@sha256:37ff334612f77d8f999c10af8797727b731629c26f2e83caa6af390998bdc49c                                                 0.0s
 => [anm_ui internal] load build context                                                                                                                                                 0.1s
 => => transferring context: 69.67kB                                                                                                                                                     0.1s
 => CACHED [anm_ui client_base 2/8] WORKDIR /usr/src/app                                                                                                                                 0.0s
 => CACHED [anm_ui client_base 3/8] RUN apt-get update && apt-get install -y --no-install-recommends     openssh-client     git     net-tools     iputils-ping     dnsutils     tracero  0.0s
 => CACHED [anm_ui client_base 4/8] RUN mkdir -p /root/.ssh/                                                                                                                             0.0s
 => CACHED [anm_ui client_base 5/8] RUN ssh-keygen -t rsa -b 4096 -C "dev@example.com" -f /root/.ssh/id_rsa -N "SSH key for custom npm package"                                            0.0s
 => CACHED [anm_ui client_base 6/8] RUN ssh-keyscan repo.some.internal.repo.com >> /root/.ssh/known_hosts                                                                      0.0s
 => CACHED [anm_ui client_base 7/8] COPY client/package*.json ./                                                                                                                         0.0s
 => [anm_ui client_base 8/8] RUN npm install --include=dev                                                                                                                             452.7s
 => [anm_ui anm_prod_build 1/4] WORKDIR /usr/src/app                                                                                                                                     0.0s
 => [anm_ui anm_prod_build 2/4] COPY ./client/ .                                                                                                                                         0.9s
 => [anm_ui anm_prod_build 3/4] WORKDIR /usr/src/app/client                                                                                                                              0.1s
 => ERROR [anm_ui anm_prod_build 4/4] RUN npm run build                                                                                                                                108.0s
------
 > [anm_ui anm_prod_build 4/4] RUN npm run build:
0.355 
0.355 > client@2.0.6 build
0.355 > NODE_OPTIONS=--openssl-legacy-provider GENERATE_SOURCEMAP=false react-app-rewired build
0.355 
2.522 Creating an optimized production build...
107.5 Failed to compile.
107.5 
107.5 ./node_modules/react-draggable/build/cjs/Draggable.js 260:22
107.5 Module parse failed: Unexpected token (260:22)
107.5 File was processed with these loaders:
107.5  * ./node_modules/babel-loader/lib/index.js
107.5 You may need an additional loader to handle the result of these loaders.
107.5 |   // the underlying DOM node ourselves. See the README for more information.
107.5 |   findDOMNode() /*: ?HTMLElement*/{
107.5 >     return this.props?.nodeRef?.current ?? _reactDom.default.findDOMNode(this);
107.5 |   }
107.5 |   render() /*: ReactElement<any>*/{
107.5 
107.5 
------
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
jacky@jacky-ubuntu-anywhere:~/Documents/gitproj/anc-frontend$
```

From the log we can have clue for debugging our build failure
1. The build failure is related to babel, which is a JavaScript compiler, it is used to convert the JSX syntax to JavaScript, and it is used in the A-NC project.
2. The build failure is related to react-draggable, which is a library used to provide drag and drop functionality in the A-NC project.
3. The build failure is related to the findDOMNode() function, which is used to find the underlying DOM node of a React component.

## Resolving the Issue
We found that the DraggableModel.jsx component is using the optional chaining operator, which is a feature introduced in ECMAScript 2020, while the host machine's babel configuration can handle the optional chaining operator, however the babel configuration used in the docker container is not updated to support the optional chaining operator. We need to update the babel configuration in the docker container to support the optional chaining operator.

We target on the problematic package and update our `client/config-overrides.js` to include the following code:

```
// Add Babel loader for specific node_modules that use modern JS syntax
addWebpackModuleRule({
    test: /\.(js|jsx)$/,
    include: [
        path.resolve(__dirname, "node_modules/react-draggable")
    ],
    use: {
        loader: "babel-loader",
        options: {
            presets: [
                ["@babel/preset-env", {
                    targets: {
                        browsers: [">0.2%", "not dead", "not op_mini all"]
                    }
                }]
            ],
            plugins: [
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-nullish-coalescing-operator"
            ]
        }
    }
})
```
This fix specifically target the problematic package and update the babel configuration to support the optional chaining operator. After rebuilding the container, the build is success.

But the main reason why host and CI/CD build have different build outcome is mainly due to the below reasons

- The node version differences between host machine and CI/CD pipeline, the host machine is using node v18.12.1 while the CI/CD pipeline is using node v22.17.1. The node version used in the CI/CD pipeline is specified in the `wProd.Dockerfile`.

- The babel configuration used in host machine is backed by Create React App (CRA) while the babel configuration used in the docker container is specified in the `client/config-overrides.js`. The babel configuration in `client/config-overrides.js` is not comprehensive enough to support all the latest JavaScript syntax used in the project. Since the production build does not run through CRA, the babel configuration in `client/config-overrides.js` is not applied, and hence the build is success. By updating the configuration in `client/config-overrides.js`, the build is success in the docker container in CI/CD too. 

## The Lessons Learned
1. Different node versioning between the host machine's container's node version with the one used in building the production container can lead to unexpected build failure. Making sure the versioning between the development and production environment is consistent is crucial to avoid such issue.

2. When encountered with build failure related to babel, it is worth to check the babel configuration used in the docker container to make sure it is up to date and support the latest JavaScript syntax. 

3. Instead of comprehensively applying babel configuration to all the packages, it is more efficient to target the problematic package and update the babel configuration to support the specific JavaScript syntax used in the package.

4. The babel configuration hierachy is complex but important to know which one is overriding or superseding each other. In this case, the babel configuration in `client/config-overrides.js` is overriding the babel configuration in `package.json`. Modifying incorrect babel configuration file will not resolve the issue. Below section further explain the babel configuration hierachy.

    ###  Babel Configuration Hierachy

    Babel follows a specific configuration resolution order (from highest to lowest priority):

    1. Inline options (in webpack loaders, `config-overrides.js`)
    Programmatic options (passed to Babel API)

    2. Configuration files in this order:
        - babel.config.* (project-wide, recommended for mono-repos)
        - .babelrc.* (directory-specific)
        - package.json "babel" field
