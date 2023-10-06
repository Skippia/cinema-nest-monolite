FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# Copy necessary configs and libraries
COPY tsconfig.json tsconfig.build.json nest-cli.json .env ./
COPY data data
COPY src src

# Copy files for generating prisma order-write db types
COPY prisma/schema.prisma prisma/schema.prisma

# Install dependencies
RUN yarn add -D @nestjs/cli
RUN yarn install --frozen-lockfile

# Generate prisma types
RUN yarn prisma:generate

RUN yarn build

FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy necessary files for pnpm workspace
COPY package.json yarn.lock ./

# Copy files for generating prisma order-write db types
COPY prisma/schema.prisma prisma/schema.prisma

# Install production dependencies for root workspace
RUN yarn install --production --frozen-lockfile

# Generate prisma types
RUN yarn prisma:generate

# Remove the schema folder 
RUN rm -rf ./prisma

# Copy built files
COPY --from=development /usr/src/app/dist /usr/src/app/dist
	
CMD ["node", "./dist/src/main"] 
