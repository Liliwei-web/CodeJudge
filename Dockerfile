# CodeJudge 运行环境：Node + gcc/g++/python3 一把装齐，判题需要真实编译运行
FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先装依赖，利用 Docker 层缓存
COPY package.json package-lock.json .npmrc ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production \
    PORT=8787

EXPOSE 8787

CMD ["node", "server/src/index.js"]
