FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 의존성 설치 파일 복사
COPY package.json package-lock.json ./
RUN npm ci

# 소스코드 복사 및 Next.js 빌드
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
