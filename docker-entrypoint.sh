# Start the PostgreSQL server
gosu postgres pg_ctl start --wait

# Start the Node.js server
pnpm start
