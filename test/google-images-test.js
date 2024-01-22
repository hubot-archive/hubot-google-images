/* eslint-disable func-names */
/* global describe it context beforeEach afterEach */

const chai = require('chai');
chai.use(require('sinon-chai'));
const nock = require('nock');

const { expect } = chai;
chai.config.truncateThreshold = 0;
describe('google-images', () => {
    context('full configuration', () => {
    let robot;
    let user;

    beforeEach(async () => {
      process.env.HUBOT_GOOGLE_CSE_KEY = 'TheCSEKey';
      process.env.HUBOT_GOOGLE_CSE_ID = 'TheCSEId';
      process.env.HUBOT_MUSTACHIFY_URL = 'https://mustache.example.com/generate';
      process.env.HUBOT_GOOGLE_IMAGES_HEAR = '1';
      process.env.HUBOT_GOOGLE_SAFE_SEARCH = '1';
      process.env.HUBOT_GOOGLE_IMAGES_FALLBACK = 'https://image-me.example.com';
      nock.disableNetConnect();
      const { Robot } = (await import('hubot')).default;
      const DummyAdapter = (await import('./fixtures/DummyAdapter.mjs')).default;
      robot = new Robot(DummyAdapter, false, 'hubot');
      await robot.loadAdapter();
      await robot.loadFile('./src', 'google-images.js');
      await robot.run();
      user = robot.brain.userForId('alice', { name: 'alice' })
    });

    afterEach(() => {
      delete process.env.HUBOT_GOOGLE_CSE_KEY;
      delete process.env.HUBOT_GOOGLE_CSE_ID;
      delete process.env.HUBOT_MUSTACHIFY_URL;
      delete process.env.HUBOT_GOOGLE_IMAGES_HEAR;
      delete process.env.HUBOT_GOOGLE_SAFE_SEARCH;
      delete process.env.HUBOT_GOOGLE_IMAGES_FALLBACK;
      nock.cleanAll();
      robot.shutdown();
    });

    context('hubot image me <query>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
          })
          .replyWithFile(200, './test/fixtures/image-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.match(/https:\/\/octodex.github.com\/images\/(.*).(png|jpg)/);
        })

        await robot.adapter.say(user, 'hubot image me octocat', 'room1');
      });
    });

    context('hubot animate me <query>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
            fileType: 'gif',
            hq: 'animated',
            tbs: 'itp:animated',
          })
          .replyWithFile(200, './test/fixtures/animate-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('https://cdn.dribbble.com/users/906441/screenshots/6364613/walkcyclevector24_dribbble.gif');
          done();
        })
        await robot.adapter.say(user, 'hubot animate me octocat', 'room1');
      });
    });

    context('hubot mustache me <url>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
            imgType: 'face',
          })
          .replyWithFile(200, './test/fixtures/image-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.match(/https:\/\/mustache\.example\.com\/generate\/rand\?src=https%3A%2F%2Foctodex\.github\.com%2Fimages%2F(.*)\.(png|jpg)/);
        });
        await robot.adapter.say(user, 'hubot mustache me octocat', 'room1');
      });
    });

    context('hubot image me <query> - no matches', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
          })
          .reply(200, []);
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Oops. I had trouble searching \'octocat\'. Try later.');
        });
        await robot.adapter.say(user, 'hubot image me octocat', 'room1');
      });
    });

    context('hubot image me <query> - over quota error', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
          })
          .reply(403);
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Bad HTTP response :( 403');
        });
        await robot.adapter.say(user, 'hubot image me octocat', 'room1');
      });
    });

    context('hubot mustache me <query>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
            imgType: 'face',
          })
          .replyWithFile(200, './test/fixtures/image-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('https://mustache.example.com/generate/rand?src=https%3A%2F%2Foctodex.github.com%2Fimages%2Foriginal.png');
          done();
        });
        await robot.adapter.say(user, 'hubot mustache me https://octodex.github.com/images/original.png', 'room1');
      });
    });
  });

  context('missing configuration', async () => {
    let robot;
    let user;
    beforeEach(async () => {
      nock.disableNetConnect();
      const { Robot } = (await import('hubot')).default;
      const DummyAdapter = (await import('./fixtures/DummyAdapter.mjs')).default;
      robot = new Robot(DummyAdapter, false, 'hubot');
      await robot.loadAdapter();
      await robot.loadFile('./src', 'google-images.js');
      await robot.run();
      user = robot.brain.userForId('alice', { name: 'alice' })
    });

    afterEach(() => {
      nock.cleanAll();
      robot.shutdown();
    });

    context('hubot image me <query>', () => {
      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Google Image Search API is no longer available. Please [setup up Custom Search Engine API](https://github.com/hubot-scripts/hubot-google-images#cse-setup-details).');
          expect(strings[1].to.eq('http://i.imgur.com/CzFTOkI.png'));
        });
        await robot.adapter.say(user, 'hubot image me octocat', 'room1');
      });
    });

    context('hubot animate me <query>', () => {
      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Google Image Search API is no longer available. Please [setup up Custom Search Engine API](https://github.com/hubot-scripts/hubot-google-images#cse-setup-details).');
          expect(strings[1].to.eq('http://i.imgur.com/CzFTOkI.png'));
        });
        await robot.adapter.say(user, 'hubot animate me octocat', 'room1');
      });
    });

    context('hubot mustache me <url>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
            imgType: 'face',
          })
          .replyWithFile(200, './test/fixtures/image-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Sorry, the Mustachify server is not configured.');
          expect(strings[1].to.eq('http://i.imgur.com/BXbGJ1N.png'));
        });
        await robot.adapter.say(user, 'hubot mustache me octocat', 'room1');
      });
    });

    context('hubot mustache me <query>', () => {
      beforeEach(() => {
        nock('https://www.googleapis.com')
          .get('/customsearch/v1')
          .query({
            q: 'octocat',
            searchType: 'image',
            safe: '1',
            fields: 'items(link)',
            cx: 'TheCSEId',
            key: 'TheCSEKey',
            imgType: 'face',
          })
          .replyWithFile(200, './test/fixtures/image-search.json');
      });

      it('hubot responds with message', async () => {
        robot.on('send', (envelope, ...strings) => {
          expect(strings[0]).to.eq('Sorry, the Mustachify server is not configured.');
          expect(strings[1].to.eq('http://i.imgur.com/BXbGJ1N.png'));
        });
        await robot.adapter.say(user, 'hubot mustache me https://octodex.github.com/images/original.png', 'room1');
      });
    });
  });
});
