FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . .

EXPOSE $PORT
CMD ["npm", "run", "start:prod"]