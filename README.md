# hubot-google-images

A hubot script that interacts with the Google Custom Search API for greater
productivity and lulz.

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
Google no longer offers an unregistered image search API. You must set up a
[Google Custom Search API](https://developers.google.com/custom-search/docs/overview) and set
the environment variables `HUBOT_GOOGLE_CSE_ID` and `HUBOT_GOOGLE_CSE_KEY`.

The Custom Search API provides up to [100 search queries per day](https://developers.google.com/custom-search/json-api/v1/overview) for free.
If you need more than that you'll have to pay.

#### CSE setup details
1. Create a CSE via these [instructions](https://developers.google.com/custom-search/docs/tutorial/creatingcse).
  - To simulate the old behavior:  select "Search the entire web but emphasize included sites" in 'Sites to Search'
  - Give it any site on creation, and then remove it when it's selected, unless you want to emphasize that site(s).
2. Turn on images in Edit Search Engine > Setup > Basic > Image Search
3. Get the CSE ID in Edit Search Engine > Setup > Basic > Details (via [these instructions](https://support.google.com/customsearch/answer/2649143?hl=en))
4. Get the CSE KEY here https://code.google.com/apis/console
  - You will need a project, you may reuse an existing one, or create a new one
  - Select the project
  - Goto the API manager and create a server credential and use the key from that credential
5. Enable Custom Search API
  - https://console.developers.google.com
  - Select "Enable APIs and get credentials like keys" in your new project
  - Click "Custom Search API"
  - Click the button "Enable API"
6. Update your conf (and your modules if necessary)

### Custom Mustachification Service

To enable the `mustache me` feature, set the environment variable  `HUBOT_MUSTACHIFY_URL`
to your mustachify server url. More info and the source code of mustachify can be
found at [https://github.com/afeld/mustachio](https://github.com/afeld/mustachio)

### Listen for `image me` and `animate me`

If you want to have your bot respond to any chat that begins with `image me` or
`animate me`, you can add `HUBOT_GOOGLE_IMAGES_HEAR` to a non-empty value to
have the robot listen to all chat.

## Sample Interaction

```
user1>> hubot image me bananas
hubot>> http://upload.wikimedia.org/wikipedia/commons/4/4c/Bananas.jpg
user2>> hubot animate me it's happening
hubot>> http://i.kinja-img.com/gawker-media/image/upload/s--8U6TKXoi--/thfydh8egnt8he5esoz8.gif
user3>> hubot mustache me family portrait
hubot>> http://mustachify.me/1?src=http://www.daviddanielsphotography.com/wp-content/uploads/2013/03/Chowen-Family-Portraits-east-of-Park-City-13.jpg
```
