FROM node:20-alpine
WORKDIR /app

# 빌드 시 TypeScript 등 devDependencies를 포함하여 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스코드 복사 및 Next.js 최적화 빌드
COPY . .
RUN npm run build

# 런타임 프로덕션 모드 환경변수
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
