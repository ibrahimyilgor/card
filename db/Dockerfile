FROM timescale/timescaledb:latest-pg15
COPY init.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=postgres

EXPOSE 5432