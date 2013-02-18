# SHam InVadorz (shiv)

A small fun game designed to congratulate one of my coworkers. As the previous winner of the "Innovation Award"
it was my duty to come up with a creative way to pass the award onto someone new. Chris Sham is the recipient
of the award this time around, and this game is dedicated to him.

## Run the game

The game needs to be served by a webserver. If you have a server that is serving the `/var/www` folder, you can do:

```shell
git clone https://github.com/englercj/shiv.git /var/www/shiv
```

Then visit `yoursite.com/shiv`

If you don't feel like setting up something like Nginx or Apache2 you can use the built-in server (requires [node.js][0]):

```shell
git clone https://github.com/englercj/shiv.git &&
cd shiv &&
npm install express &&
node server.js
```

Then visit `yoursite.com:8001` to play.