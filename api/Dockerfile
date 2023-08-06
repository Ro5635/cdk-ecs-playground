# syntax=docker/dockerfile:1

# BUILD STAGE
FROM golang:1.19 AS build-stage

WORKDIR /app
COPY go.mod go.sum ./
COPY *.go ./

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /application

CMD ["/application"]


# BUILD RELEASE STAGE
FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /application /application

EXPOSE 80

USER nonroot:nonroot

ENTRYPOINT ["/application"]


# build this image with
# docker build --tag ecs-test-app .

# Pushing to ECR in robertSandbox
# docker tag ecs-test-app:latest YOURACCOUNTNUMBER.dkr.ecr.eu-west-2.amazonaws.com/ecs-test-app
# docker push YOURACCOUNTNUMBER.dkr.ecr.eu-west-2.amazonaws.com/ecs-test-app:latest

# if your on windows then the ecr cred helper is not so helpful
# so do the below:
# aws ecr get-login-password --region eu-west-2 --profile robertSandbox | docker login --username AWS --password-stdin YOURACCOUNTNUMBER.dkr.ecr.eu-west-2.amazonaws.com
# docker push YOURACCOUNTNUMBER.dkr.ecr.eu-west-2.amazonaws.com/ecs-test-app:latest
