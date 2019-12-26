FROM node:erbium

# make app directory
WORKDIR /usr/src/app

# use wild card to copy both of package.json and package-lock.json
COPY package*.json ./

# install app dependencies
RUN npm install && \
    npm install -g mocha

# add app source
COPY . .

CMD [ "npm", "test" ]