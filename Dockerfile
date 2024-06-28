FROM node:20-slim as base
WORKDIR /app
USER node
# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && npm install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && npm install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN npm run build

# copy production dependencies and source code into final image
FROM base AS release

# Run the application as a non-root user.
COPY --chown=node:node package.json .
COPY --chown=node:node --from=install /temp/prod/node_modules node_modules
COPY --chown=node:node --from=prerelease /usr/src/app/dist ./dist

# run the app
USER node
EXPOSE 3000/tcp