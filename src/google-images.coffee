# Description:
#   A way to interact with the Google Images API.
#
# Configuration
#   HUBOT_GOOGLE_API_KEY - Your developer API key
#   HUBOT_GOOGLE_CSE_ID - The ID of your Custom Search Engine
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
    type = Math.floor(Math.random() * 6)
    mustachify = "http://mustachify.me/#{type}?src="
    imagery = msg.match[1]

    if imagery.match /^https?:\/\//i
      msg.send "#{mustachify}#{imagery}"
    else
      imageMe msg, imagery, false, true, (url) ->
        msg.send "#{mustachify}#{url}"

imageMe = (msg, query, animated, faces, cb) ->
  cb = animated if typeof animated == 'function'
  cb = faces if typeof faces == 'function'
  googleCseId = process.env.HUBOT_GOOGLE_CSE_ID
  googleApiKey = process.env.HUBOT_GOOGLE_API_KEY
  if googleCseId
    q = q: query, searchType:'image', safe:'high',
    fields:'items(link)',
    cx: googleCseId, key: googleApiKey
    if typeof animated is 'boolean' and animated is true
      q.fileType = 'gif'
      q.hq = 'animated'
    q.imgType = 'face' if typeof faces is 'boolean' and faces is true
    url = 'https://www.googleapis.com/customsearch/v1'
  else
    q = v: '1.0', rsz: '8', q: query, safe: 'active'
    q.imgtype = 'animated' if typeof animated is 'boolean' and animated is true
    q.imgtype = 'face' if typeof faces is 'boolean' and faces is true
    url = 'https://ajax.googleapis.com/ajax/services/search/images'
  msg.http(url)
    .query(q)
    .get() (err, res, body) ->
      response = JSON.parse(body)
      images = response.responseData.results if response?.responseData
      images = response.items if response?.items
      if images?.length > 0
        image = msg.random images
        imgsrc = image.unescapedUrl
        imgsrc = image.link if image.link
        cb ensureImageExtension imgsrc
      else
        msg.send "Oops. I'm having trouble finding '#{query}'. Try again later."
        ((error) ->
          msg.robot.logger.error error.message
          msg.robot.logger
            .error "(see #{error.extendedHelp})" if error.extendedHelp
        ) error for error in response.error.errors if response.error?.errors


ensureImageExtension = (url) ->
  ext = url.split('.').pop()
  if /(png|jpe?g|gif)/i.test(ext)
    url
  else
    "#{url}#.png"
