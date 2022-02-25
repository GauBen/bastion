# Start the PostgreSQL server
gosu postgres pg_ctl start

# Reset and populate the database
pnpm prisma migrate reset

# Start the server
node .
