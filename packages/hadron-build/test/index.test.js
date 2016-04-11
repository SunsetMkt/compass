'use strict';
/* eslint no-unused-vars: 1 */

const hadronBuild = require('../');
const commands = hadronBuild;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

chai.use(require('sinon-chai'));

describe('hadron-build', () => {
  it('should export a default function', () => {
    expect(hadronBuild).to.be.a('function');
  });

  describe('::clean', () => {
    it('should include options from commands::ui', () => {
      expect(commands.clean.builder).to.have.property('less_cache');
      expect(commands.clean.builder).to.have.property('template_cache');
    });
  });

  describe('::develop', () => {
    it('should include options from commands::ui', () => {
      expect(commands.develop.builder).to.have.property('less_cache');
      expect(commands.develop.builder).to.have.property('template_cache');
    });

    it('should include tasks from commands::ui');

    it('should include options from commands::verify', () => {
      expect(commands.develop.builder).to.have.property('nodejs_version');
      expect(commands.develop.builder).to.have.property('npm_version');
    });

    it('should include tasks from commands::verify');


    describe('::handler', () => {
      it('should set `NODE_ENV` to development');
      it('should set `DEVTOOLS` to `1` when --devtools is specified');
      it('should spawn electron-prebuilt');
    });
  });

  describe('::release', () => {
    it('should include options from commands::ui', () => {
      expect(commands.release.builder).to.have.property('less_cache');
      expect(commands.release.builder).to.have.property('template_cache');
    });

    it('should include options from commands::verify', () => {
      expect(commands.release.builder).to.have.property('nodejs_version');
      expect(commands.release.builder).to.have.property('npm_version');
    });
  });

  describe('::test', () => {
    describe('::getMochaArgs', () => {
      it('should allow pass through of mocha cli options', () => {
        var argv = {
          _: [],
          $0: 'hadron-build',
          help: false,
          recursive: true,
          grep: '#spectron'
        };

        expect(commands.test.getMochaArgs(argv)).to.deep.equal([
          '--recursive', '--grep', '#spectron'
        ]);
      });
    });

    describe('::handler', () => {
      it('should set `NODE_ENV` to testing');
      it('should set the TEST_WITH_PREBUILT environment variable if --release specified');
      it('should remove the user-date directory');
      it('should spawn electron-mocha');
    });
  });
  describe('::upload', () => {

  });
  describe('::ui', () => {
    it('should include a `less_cache` option', () => {
      expect(commands.ui.builder).to.have.property('less_cache');
    });

    it('should default `less_cache` to `src/app/less-cache`');

    it('should have a `template_cache` option', () => {
      expect(commands.ui.builder).to.have.property('template_cache');
    });

    it('should default `template_cache` to `src/app/templates.js`');

    it('should generate the less cache');

    it('should generate the template cache');
  });

  describe('::verify', () => {
    it('should have a `nodejs_version` option', () => {
      expect(commands.verify.builder).to.have.property('nodejs_version');
    });

    it('should have a `npm_version` option', () => {
      expect(commands.verify.builder).to.have.property('npm_version');
    });

    it('should use `engines.node` for the default `nodejs_version` option');

    it('should use `engines.npm` for the default `npm_version` option');

    describe('::handler', () => {
      it('should check the environment\'s Python installation');

      it('should check the environment\'s npm installation');

      it('should check the environment\'s node.js installation');
    });
  });
});
