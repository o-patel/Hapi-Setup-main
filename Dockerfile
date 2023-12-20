FROM node:16-alpine
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm install pm2 -g
COPY . ./
ENV PORT 4000
EXPOSE $PORT
CMD ["pm2-runtime", "start", "index.js", "--name", "node-ec2"]