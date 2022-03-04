# Start the PostgreSQL server
gosu postgres pg_ctl start --wait
trap 'gosu postgres pg_ctl stop -m fast --wait' TERM INT EXIT

# Start the Node.js server
pnpm start &
child=$!
wait "$child"
