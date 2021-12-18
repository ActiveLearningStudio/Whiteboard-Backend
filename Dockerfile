FROM ubuntu:20.04

WORKDIR /usr/src/whiteboard-service

COPY dist/whiteboard-service .

EXPOSE 8000

ENTRYPOINT [ "./whiteboard-service" ]
