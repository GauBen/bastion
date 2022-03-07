# This script starts a local developement server
# Requirements:
# - Volta (https://volta.sh/)
# - Docker (https://www.docker.com/get-started)

set -eu # Exit on errors
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}▮  Checking local software versions${NC}"
echo "Volta: v$(volta --version) (^1.0.5)"
echo "Docker Compose: $(docker-compose --version --short) (^2.2.3)"
echo

echo -e "${RED}▮  Installing dependencies${NC}"
volta install node
volta install corepack
yarn install
echo

echo -e "${RED}▮  Starting a local database server${NC}"
docker-compose up --wait
if [ ! -f '.env' ]; then
  echo ".env file not found, using the default (.env.example)"
  cp .env.example .env
fi
yarn prisma migrate deploy
yarn prisma generate
function cleanup() { docker-compose stop; echo; }
trap cleanup EXIT
echo

echo -e "${RED}▮  Starting the local development server on http://localhost:8080${NC}"
yarn dev
