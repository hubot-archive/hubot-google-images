# hubot-google-images

A hubot script that interacts with the Google Images API for greater productivity and lulz.

See [`src/google-images.coffee`](src/google-images.coffee) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-google-images --save`

Then add **hubot-google-images** to your `external-scripts.json`:

```json
[
  "hubot-google-images"
]
```

## Sample Interaction

```
user1>> hubot image me bananas
hubot>> http://upload.wikimedia.org/wikipedia/commons/4/4c/Bananas.jpg
user2>> hubot animate me it's happening
hubot>> http://i.kinja-img.com/gawker-media/image/upload/s--8U6TKXoi--/thfydh8egnt8he5esoz8.gif
user3>> hubot mustache me family portrait
hubot>> http://mustachify.me/1?src=http://www.daviddanielsphotography.com/wp-content/uploads/2013/03/Chowen-Family-Portraits-east-of-Park-City-13.jpg
```
