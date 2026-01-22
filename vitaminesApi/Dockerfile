FROM node:20

WORKDIR /vitaminesApi

COPY package*.json ./

RUN npm install -g npm@latest \
 && npm ci \
 && npm audit --audit-level=high


COPY . .
# Créer utilisateurs et Changer les permissions
RUN groupadd -r api && useradd -r -g api api
RUN chown -R api:api .

USER api


EXPOSE 3000
CMD ["node", "index.js"]
