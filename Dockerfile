FROM node:18-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@5.0.1 -g --silent
COPY . ./
RUN npm install
RUN npm run build

# production environment
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app ./
RUN rm -R ./build/__tests__

EXPOSE 80
CMD [ "node", "build/index.js" ]