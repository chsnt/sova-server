#FROM 10.216.3.255:8123/oracle:12.2.0.1
FROM store/oracle/database-enterprise:12.2.0.1-slim

RUN mkdir /home/oracle/sql \
    && mkdir /home/oracle/dump

#COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

#WORKDIR /app
