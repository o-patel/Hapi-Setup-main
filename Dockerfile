FROM node:14.15.0-alpin
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 1400
CMD ["npm", "start"]