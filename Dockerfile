FROM node:10-slim

RUN mkdir /opt/hub
WORKDIR /opt/hub
RUN npm init -y
RUN npm install express elasticsearch jquery jquery-ui-dist socket.io angularjs d3 popper.js body-parser 
COPY index.js index.js
COPY sanity.js sanity.js
COPY db.js db.js
COPY config.json config.json
COPY views views
COPY js js
COPY css css

CMD node index.js
