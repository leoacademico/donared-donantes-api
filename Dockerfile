FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY src ./src

# La imagen base node:alpine ya incluye un usuario "node" sin privilegios;
# lo usamos en vez de root para reducir el impacto si el contenedor es comprometido.
RUN chown -R node:node /app
USER node

EXPOSE 3000
ENV PORT=3000

CMD ["node", "src/server.js"]
