# Étape 1 : build de l'app
FROM node:20 as builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Étape 2 : serveur nginx
FROM nginx:alpine

# Copie le build vers nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Supprime config par défaut nginx et ajoute la tienne
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
