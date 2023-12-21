FROM node:14-alpin
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 1400
CMD ["npm", "start"]