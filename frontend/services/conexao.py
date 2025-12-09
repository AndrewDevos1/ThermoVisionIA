import psycopg2

conn = psycopg2.connect(
    database="ThermoVision",  # Coloque o database que vai manipular no postgresSQL
    user="postgres",
    password="password",
    host="localhost",
    port="5432",
)
