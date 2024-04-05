Zettelcasten Index: 20240405210605
Sequence: [How Multi-Stage Docker Build Optimises Image Size](How%20Multi-Stage%20Docker%20Build%20Optimises%20Image%20Size.md)
Status: #idea
Zettelcasten Tags: *Docker*, *Docker Multi-Stage Build*, *Containerisation*, *Deployment*, *DevOps*, *Dockerfile*, *Microservices*, *Optimisation*, *Best Practices*, *Image Size Reduction*, *CICD*, *Caching*

---

Multi-stage Dockerfiles can be used to:

* Optimise the size of a Docker image
* Easier to debug each stage
* Can use cached images so subsequent stages are quicker

Example:

````dockerfile
FROM node:14-alpine as base
ADD . /app
WORKDIR /app
COPY package.json .
RUN npm install

FROM alpine:latest
COPY --from=base /app /app
WORKDIR /app
EXPOSE 3002
CMD [ "node", "app.js" ]
````

## References
