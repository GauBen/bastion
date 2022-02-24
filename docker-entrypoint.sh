# Start the PostgreSQL server
gosu postgres pg_ctl start

# Populate the database
pnpm prisma db push && pnpm prisma db seed

# Start the server
node .
