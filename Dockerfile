FROM node:carbon
# FROM node:dubnium
# FROM node:erbium

# make app directory
WORKDIR /usr/src/app

# use wild card to copy both of package.json and package-lock.json
COPY package*.json ./

# install app dependencies
RUN npm install && \
    npm install -g mocha@6.2.2
# install solc
RUN curl -o /usr/bin/solc -fL https://github.com/ethereum/solidity/releases/download/v0.5.6/solc-static-linux \
    && chmod u+x /usr/bin/solc

# add app source
COPY . .

CMD [ "npm", "test" ]
