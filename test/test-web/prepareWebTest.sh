# Copy the bundle file to inject in HTML file (This will overwrite caver.min.js)
cp ../../dist/caver.min.js ./public/caver.min.js

# Copy the test configuration file
DEV_URL=${EN_RPC_URL_DEV}
if [ "${DEV_URL}" = "" ]; then
	ENV_FILE="../../.env"
	DEV_ENV=$(grep ${ENV_FILE} -e "EN_RPC_URL_DEV=")
	DEV_URL=${DEV_ENV//"EN_RPC_URL_DEV="/""}
else
	DEV_URL="'${DEV_URL}'"
fi

# install modules
rm -rf node_modules package-lock.json
npm install

# Copy the configuration file for eslint (To avoid eslint config conflict with outer project)
cp .eslintrc_template.js .eslintrc.js

# Make dev url file and replace `testrpc` string in index.html file
echo module.exports=${DEV_URL} > ./src/testrpc.js
sed -i' ' "s/testrpc/${DEV_URL/\/\//\\/\\/}/g" ./public/index.html

# Prepare to test (background running)
./node_modules/pm2/bin/pm2 --name BundleTest start npm -- start