/* eslint-disable func-names */
/* global describe it context beforeEach afterEach */

const Helper = require('hubot-test-helper');
const chai = require('chai');
chai.use(require('sinon-chai'));
const nock = require('nock');

const helper = new Helper(['../src/google-images.js']);
const { expect } = chai;
chai.config.truncateThreshold = 0;

describe('google-images', () => {
  context('full configuration', () => {
    let selfRoom;

    beforeEach(() => {
      process.env.HUBOT_GOOGLE_CSE_KEY = 'TheCSEKey';
      process.env.HUBOT_GOOGLE_CSE_ID = 'TheCSEId';
      process.env.HUBOT_MUSTACHIFY_URL = 'https://mustache.example.com/generate';
      process.env.HUBOT_GOOGLE_IMAGES_HEAR = '1';
      process.env.HUBOT_GOOGLE_SAFE_SEARCH = '1';
      process.env.HUBOT_GOOGLE_IMAGES_FALLBACK = 'https://image-me.example.com';
      nock.disableNetConnect();
      selfRoom = helper.createRoom();
    });

    afterEach(() => {
      delete process.env.HUBOT_GOOGLE_CSE_KEY;
      delete process.env.HUBOT_GOOGLE_CSE_ID;
      delete process.env.HUBOT_MUSTACHIFY_URL;
      delete process.env.HUBOT_GOOGLE_IMAGES_HEAR;
      delete process.env.HUBOT_GOOGLE_SAFE_SEARCH;
      delete process.env.HUBOT_GOOGLE_IMAGES_FALLBACK;
      nock.cleanAll();
      selfRoom.destroy();
    });

    context('hubot image me <query>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot image me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.match(/https:\/\/octodex.github.com\/images\/(.*).(png|jpg)/);
      });
    });

    context('hubot animate me <query>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot animate me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('https://cdn.dribbble.com/users/906441/screenshots/6364613/walkcyclevector24_dribbble.gif');
      });
    });

    context('hubot mustache me <url>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot mustache me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.match(/https:\/\/mustache\.example\.com\/generate\/rand\?src=https%3A%2F%2Foctodex\.github\.com%2Fimages%2F(.*)\.(png|jpg)/);
      });
    });

    context('hubot image me <query> - no matches', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot image me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('Oops. I had trouble searching \'octocat\'. Try later.');
      });
    });

    context('hubot image me <query> - over quota error', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot image me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('Bad HTTP response :( 403');
      });
    });

    context('hubot mustache me <query>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot mustache me https://octodex.github.com/images/original.png');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('https://mustache.example.com/generate/rand?src=https%3A%2F%2Foctodex.github.com%2Fimages%2Foriginal.png');
      });
    });
  });

  context('missing configuration', () => {
    let selfRoom;

    beforeEach(() => {
      nock.disableNetConnect();
      selfRoom = helper.createRoom();
    });

    afterEach(() => {
      nock.cleanAll();
      selfRoom.destroy();
    });

    context('hubot image me <query>', () => {
      beforeEach((done) => {
        selfRoom.user.say('alice', 'hubot image me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq(
          'Google Image Search API is no longer available. Please [setup up Custom Search Engine API](https://github.com/hubot-scripts/hubot-google-images#cse-setup-details).',
        );
        expect(selfRoom.messages[2][1]).to.eq(
          'http://i.imgur.com/CzFTOkI.png',
        );
      });
    });

    context('hubot animate me <query>', () => {
      beforeEach((done) => {
        selfRoom.user.say('alice', 'hubot animate me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq(
          'Google Image Search API is no longer available. Please [setup up Custom Search Engine API](https://github.com/hubot-scripts/hubot-google-images#cse-setup-details).',
        );
        expect(selfRoom.messages[2][1]).to.eq(
          'http://i.imgur.com/CzFTOkI.png',
        );
      });
    });

    context('hubot mustache me <url>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot mustache me octocat');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('Sorry, the Mustachify server is not configured.');
        expect(selfRoom.messages[2][1]).to.eq('http://i.imgur.com/BXbGJ1N.png');
      });
    });

    context('hubot mustache me <query>', () => {
      beforeEach((done) => {
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
        selfRoom.user.say('alice', 'hubot mustache me https://octodex.github.com/images/original.png');
        setTimeout(done, 100);
      });

      it('hubot responds with message', () => {
        expect(selfRoom.messages[1][1]).to.eq('Sorry, the Mustachify server is not configured.');
        expect(selfRoom.messages[2][1]).to.eq('http://i.imgur.com/BXbGJ1N.png');
      });
    });
  });
});
