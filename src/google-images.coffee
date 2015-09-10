# Description:
#   A way to interact with the Google Images API.
#
# Configuration
#   HUBOT_GOOGLE_CSE_KEY - Your Google developer API key
#   HUBOT_GOOGLE_CSE_ID - The ID of your Custom Search Engine
#   HUBOT_MUSTACHIFY_URL - Optional. Allow you to use your own mustachify instance.
#   HUBOT_GIPHY_KEY - If GOOGLE_CSE_* aren't set, use giphy for animated images (issue #10)
#   HUBOT_GIPHY_RATING - can be one of 'y', 'g', 'pg', 'pg-13' or 'r'
#
# Commands:
#   hubot image me <query> - The Original. Queries Google Images for <query> and returns a random top result.
#   hubot animate me <query> - The same thing as `image me`, except adds a few parameters to try to return an animated GIF instead.
#   hubot mustache me <url> - Adds a mustache to the specified URL.
#   hubot mustache me <query> - Searches Google Images for the specified query and mustaches it.

module.exports = (robot) ->
  robot.respond /(image|img)( me)? (.*)/i, (msg) ->
    imageMe msg, msg.match[3], (url) ->
      msg.send url

  robot.respond /animate( me)? (.*)/i, (msg) ->
    imageMe msg, msg.match[2], true, (url) ->
      msg.send url

  robot.respond /(?:mo?u)?sta(?:s|c)h(?:e|ify)?(?: me)? (.*)/i, (msg) ->
    mustacheBaseUrl = process.env.HUBOT_MUSTACHIFY_URL?.replace(/\/$/, '') or "http://mustachify.me"
    mustachify = "#{mustacheBaseUrl}/rand?src="
    imagery = msg.match[1]

    if imagery.match /^https?:\/\//i
      encodedUrl = encodeURIComponent imagery
      msg.send "#{mustachify}#{encodedUrl}"
    else
      imageMe msg, imagery, false, true, (url) ->
        encodedUrl = encodeURIComponent url
        msg.send "#{mustachify}#{encodedUrl}"

imageMe = (msg, query, animated, faces, cb) ->
  cb = animated if typeof animated == 'function'
  cb = faces if typeof faces == 'function'
  googleCseId = process.env.HUBOT_GOOGLE_CSE_ID
  if googleCseId
    # Using Google Custom Search API
    googleApiKey = process.env.HUBOT_GOOGLE_CSE_KEY
    if !googleApiKey
      msg.robot.logger.error "Missing environment variable HUBOT_GOOGLE_CSE_KEY"
      msg.send "Missing server environment variable HUBOT_GOOGLE_CSE_KEY."
      return
    q =
      q: query,
      searchType:'image',
      safe:'high',
      fields:'items(link)',
      cx: googleCseId,
      key: googleApiKey
    if animated is true
      q.fileType = 'gif'
      q.hq = 'animated'
    if faces is true
      q.imgType = 'face'
    url = 'https://www.googleapis.com/customsearch/v1'
    msg.http(url)
      .query(q)
      .get() (err, res, body) ->
        if err
          msg.send "Encountered an error :( #{err}"
          return
        if res.statusCode isnt 200
          msg.send "Bad HTTP response :( #{res.statusCode}"
          return
        response = JSON.parse(body)
        if response?.items
          image = msg.random response.items
          cb ensureImageExtension image.link
        else
          msg.send "Oops. I had trouble searching '#{query}'. Try later."
          ((error) ->
            msg.robot.logger.error error.message
            msg.robot.logger
              .error "(see #{error.extendedHelp})" if error.extendedHelp
          ) error for error in response.error.errors if response.error?.errors
  else
    # Using deprecated Google image search API
    q = v: '1.0', rsz: '8', q: query, safe: 'active'
    q.imgtype = 'animated' if typeof animated is 'boolean' and animated is true
    q.imgtype = 'face' if typeof faces is 'boolean' and faces is true
    url = 'https://ajax.googleapis.com/ajax/services/search/images'
    use_giphy = false

    if typeof animated is 'boolean' and animated is true
      giphy_key = (process.env.HUBOT_GIPHY_KEY)
      use_giphy = (typeof giphy_key is 'string' and giphy_key.length > 0)
      if typeof use_giphy is 'boolean' and use_giphy is true
        url = 'http://api.giphy.com/v1/gifs/search'
        rating = process.env.HUBOT_GIPHY_RATING
        if rating and rating.length == 0
          rating = 'g'
        else
          if (rating != 'y') and (rating != 'g') and (rating != 'pg') and (rating != 'pg-13') and (rating != 'r')
            rating = 'g'
        q = 
          q: query
          api_key: giphy_key
          limit: 100
          rating: rating

    msg.http(url)
      .query(q)
      .get() (err, res, body) ->
        if err
          msg.send "Encountered an error :( #{err}"
          return
        if res.statusCode isnt 200
          msg.send "Bad HTTP response :( #{res.statusCode}"
          return
        images = JSON.parse(body)
        if use_giphy
          images = images.data
        else
          images = images.responseData?.results
        
        num_images = images.length
        if num_images > 0
          picked_image = images[Math.floor(Math.random()*num_images)]
          msg.send ensureImageExtension picked_image.url
        else
          msg.send "Sorry, I found no results for '#{query}'."

        if use_giphy
          msg.send "(fetched from giphy.com)"

ensureImageExtension = (url) ->
  ext = url.split('.').pop()
  if /(png|jpe?g|gif)/i.test(ext)
    url
  else
    "#{url}#.png"
