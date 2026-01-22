# Étape 1 : Build de l'app
FROM node:20 AS builder

WORKDIR /app
COPY . .
RUN npm install -g npm@latest \
 && npm ci \
 && npm audit --audit-level=high

RUN npm run build

# Étape 2 : serveur nginx
FROM nginx:alpine

# Créer un utilisateur non-root "vitamine"
RUN addgroup -S vitamine && adduser -S vitamine -G vitamine
RUN mkdir -p /var/run /run \
    && chown -R vitamine:vitamine /var/run /run
# Copier le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Donner les droits à l'utilisateur
RUN chown -R vitamine:vitamine /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

# Supprimer config par défaut et ajouter la tienne
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Passer à l'utilisateur non-root
USER vitamine

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
