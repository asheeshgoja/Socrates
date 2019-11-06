FROM ubuntu:xenial-20191010
RUN apt-get update 
RUN apt-get -y install clips

RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get -y install nodejs
# RUN apt-get -y install npm


WORKDIR /build

EXPOSE 8080
COPY ./SocratesExpertSystemRules.clp .
COPY ./run_clp_file .
COPY ./app.js .
COPY ./package.json .

RUN npm install
CMD [ "npm", "start" ]

# CMD ["clips", "-f", "run_clp_file"]