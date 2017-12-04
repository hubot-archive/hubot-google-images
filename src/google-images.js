// Description:
//   A way to interact with the Google Images API.
//
// Configuration
//   HUBOT_GOOGLE_CSE_KEY - Your Google developer API key
//   HUBOT_GOOGLE_CSE_ID - The ID of your Custom Search Engine
//   HUBOT_MUSTACHIFY_URL - Optional. Allow you to use your own mustachify instance.
//   HUBOT_GOOGLE_IMAGES_HEAR - Optional. If set, bot will respond to any line that begins with "image me" or "animate me" without needing to address the bot directly
//   HUBOT_GOOGLE_SAFE_SEARCH - Optional. Search safety level.
//   HUBOT_GOOGLE_IMAGES_FALLBACK - The URL to use when API fails. `{q}` will be replaced with the query string.
//
// Commands:
//   hubot image me <query> - The Original. Queries Google Images for <query> and returns a random top result.
//   hubot animate me <query> - The same thing as `image me`, except adds a few parameters to try to return an animated GIF instead.
//   hubot mustache me <url|query> - Adds a mustache to the specified URL or query result.

module.exports = function(robot) {

  robot.respond(/(image|img)( me)? (.+)/i, msg =>
    imageMe(msg, msg.match[3], url => msg.send(url))
  );

  robot.respond(/animate( me)? (.+)/i, msg =>
    imageMe(msg, msg.match[2], true, url => msg.send(url))
  );

  // pro feature, not added to docs since you can't conditionally document commands
  if (process.env.HUBOT_GOOGLE_IMAGES_HEAR != null) {
    robot.hear(/^(image|img) me (.+)/i, msg =>
      imageMe(msg, msg.match[2], url => msg.send(url))
    );

    robot.hear(/^animate me (.+)/i, msg =>
      imageMe(msg, msg.match[1], true, url => msg.send(url))
    );
  }

  return robot.respond(/(?:mo?u)?sta(?:s|c)h(?:e|ify)?(?: me)? (.+)/i, function(msg) {
    let encodedUrl;
    if ((process.env.HUBOT_MUSTACHIFY_URL == null)) {
      msg.send("Sorry, the Mustachify server is not configured."
        , "http://i.imgur.com/BXbGJ1N.png");
      return;
    }
    const mustacheBaseUrl =
      process.env.HUBOT_MUSTACHIFY_URL != null ? process.env.HUBOT_MUSTACHIFY_URL.replace(/\/$/, '') : undefined;
    const mustachify = `${mustacheBaseUrl}/rand?src=`;
    const imagery = msg.match[1];

    if (imagery.match(/^https?:\/\//i)) {
      encodedUrl = encodeURIComponent(imagery);
      return msg.send(`${mustachify}${encodedUrl}`);
    } else {
      return imageMe(msg, imagery, false, true, function(url) {
        encodedUrl = encodeURIComponent(url);
        return msg.send(`${mustachify}${encodedUrl}`);
      });
    }
  });
};

var imageMe = function(msg, query, animated, faces, cb) {
  if (typeof animated === 'function') { cb = animated; }
  if (typeof faces === 'function') { cb = faces; }
  const googleCseId = process.env.HUBOT_GOOGLE_CSE_ID;
  if (googleCseId) {
    // Using Google Custom Search API
    const googleApiKey = process.env.HUBOT_GOOGLE_CSE_KEY;
    if (!googleApiKey) {
      msg.robot.logger.error("Missing environment variable HUBOT_GOOGLE_CSE_KEY");
      msg.send("Missing server environment variable HUBOT_GOOGLE_CSE_KEY.");
      return;
    }
    const q = {
      q: query,
      searchType:'image',
      safe: process.env.HUBOT_GOOGLE_SAFE_SEARCH || 'high',
      fields:'items(link)',
      cx: googleCseId,
      key: googleApiKey
    };
    if (animated === true) {
      q.fileType = 'gif';
      q.hq = 'animated';
      q.tbs = 'itp:animated';
    }
    if (faces === true) {
      q.imgType = 'face';
    }
    const url = 'https://www.googleapis.com/customsearch/v1';
    return msg.http(url)
      .query(q)
      .get()(function(err, res, body) {
        if (err) {
          if (res.statusCode === 403) {
            msg.send("Daily image quota exceeded, using alternate source.");
            deprecatedImage(msg, query, animated, faces, cb);
          } else {
            msg.send(`Encountered an error :( ${err}`);
          }
          return;
        }
        if (res.statusCode !== 200) {
          msg.send(`Bad HTTP response :( ${res.statusCode}`);
          return;
        }
        const response = JSON.parse(body);
        if (response != null ? response.items : undefined) {
          const image = msg.random(response.items);
          return cb(ensureResult(image.link, animated));
        } else {
          msg.send(`Oops. I had trouble searching '${query}'. Try later.`);
          if (response.error != null ? response.error.errors : undefined) { return (() => {
            const result = [];
            for (let error of Array.from(response.error.errors)) {               result.push((function(error) {
                msg.robot.logger.error(error.message);
                if (error.extendedHelp) { return msg.robot.logger.error(`(see ${error.extendedHelp})`); }
              })(error));
            }
            return result;
          })(); }
        }
    });
  } else {
    msg.send("Google Image Search API is no longer available. " +
      "Please [setup up Custom Search Engine API](https://github.com/hubot-scripts/hubot-google-images#cse-setup-details)."
    );
    return deprecatedImage(msg, query, animated, faces, cb);
  }
};

var deprecatedImage = function(msg, query, animated, faces, cb) {
  // Show a fallback image
  let imgUrl = process.env.HUBOT_GOOGLE_IMAGES_FALLBACK ||
    'http://i.imgur.com/CzFTOkI.png';
  imgUrl = imgUrl.replace(/\{q\}/, encodeURIComponent(query));
  return cb(ensureResult(imgUrl, animated));
};

// Forces giphy result to use animated version
var ensureResult = function(url, animated) {
  if (animated === true) {
    return ensureImageExtension(url.replace(
      /(giphy\.com\/.*)\/.+_s.gif$/,
      '$1/giphy.gif')
    );
  } else {
    return ensureImageExtension(url);
  }
};

// Forces the URL look like an image URL by adding `#.png`
var ensureImageExtension = function(url) {
  if (/(png|jpe?g|gif)$/i.test(url)) {
    return url;
  } else {
    return `${url}#.png`;
  }
};
