# bastion

👀

## Developement mode

- Clone the repository
- Install [Volta](https://volta.sh) and [Docker](https://www.docker.com/get-started)
- Run `./dev.sh`

## Production mode

The whole project is designed to run in a single container:

```bash
# Create a docker image
docker build . --tag bastion:latest

# Start the container
docker run -it -p 1314:1314 bastion:latest
```
