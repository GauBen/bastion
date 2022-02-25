# Start the PostgreSQL server
gosu postgres pg_ctl start

# Reset and populate the database
pnpm prisma migrate deploy

# Start the server
pnpm start
