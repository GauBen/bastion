# Bastion

Bastion is a CTF challenge of the THCon 2022, in the web category.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48261497/215289575-df101895-24d5-41c1-9e6d-151e6a7d28fa.png" alt="Screenshot of the challenge">
</p>

## Details

Bastion is a three-stage challenge about breaking a real-time messaging application. 

The whole project is designed to run in a single container:

```bash
# Create a docker image
docker build . --tag bastion:latest

# Start the container
docker run -it -p 1314:1314 bastion:latest
```

## Writeups

* [Official write-up by Alexis Carn and Gautier Ben Aïm](./writeup.pdf)

## License

AGPL 3.0 or later
