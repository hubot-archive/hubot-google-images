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

## Configuration

### Custom Search Engine
Set environment variables `HUBOT_GOOGLE_CSE_ID` and `HUBOT_GOOGLE_CSE_KEY`
to use the [Google Custom Search API](https://developers.google.com/custom-search/docs/overview)
instead of the deprecated image search API.

You might want to use the custom search API if you have concerns about
seeing NSFW images. The old Google image search API only has `safe=active`
which is not as strict as `safe=strict` on the new API.

### Custom Mustachification Service

If you want to run you own instance instead of the default [mustachify](http://mustachify.me/), you can add `HUBOT_MUSTACHIFY_URL` to your environment variables and provide your own url. More info and the source code of mustachify can be found at [https://github.com/afeld/mustachio](https://github.com/afeld/mustachio)

## Sample Interaction

```
user1>> hubot image me bananas
hubot>> http://upload.wikimedia.org/wikipedia/commons/4/4c/Bananas.jpg
user2>> hubot animate me it's happening
hubot>> http://i.kinja-img.com/gawker-media/image/upload/s--8U6TKXoi--/thfydh8egnt8he5esoz8.gif
user3>> hubot mustache me family portrait
hubot>> http://mustachify.me/1?src=http://www.daviddanielsphotography.com/wp-content/uploads/2013/03/Chowen-Family-Portraits-east-of-Park-City-13.jpg
```
