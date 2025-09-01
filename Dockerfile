FROM node:16.15.1 as build
WORKDIR /dokably

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.19

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /dokably/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
