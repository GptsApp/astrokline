const { Agent, fetch: undiciFetch, setGlobalDispatcher } = require('undici');

const dispatcher = new Agent({
  headersTimeout: 30 * 60 * 1000,
  bodyTimeout: 30 * 60 * 1000,
});

setGlobalDispatcher(dispatcher);
globalThis.fetch = (input, init = {}) =>
  undiciFetch(input, {
    ...init,
    dispatcher: init.dispatcher || dispatcher,
  });
