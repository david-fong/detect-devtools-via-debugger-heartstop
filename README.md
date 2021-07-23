# 💞🐛 Detect Devtools Via Debugger Heartstop

[![npm version][npm-version-label]][npm-url]

Detects whether the browser's devtools are open. It opens a web worker with a polling loop that sends pulses to the main thread. Each pulse is two messages with a debugger statement in between them, which will create an abnormal delay between enclosing messages when devtools are opened on any browser that implements debugging workers and enables debugging always-if-and-only-if the devtools are opened. It does _not_ block the main thread.

## Pros and Cons

This has the benefit over other implementations that it doesn't depend on whether the devtools pane is attached to the browser window, or other deeply browser-internal behaviours such as lazy console logging of complex objects, which are much more subject to change. I think it's fair to say that it's one of the least hacky platform-agnostic solutions out there.

To devs who want some custom browser hooks for dev purposes, it has a big disadvantage that it will enter debugging for the worker thread whenever devtools are opened, which for such a use case would be extremely annoying and probably negate any convenience gained by the hook. If that sounds like your use case, this solution is probably not for you. Scroll down for [links to alternatives](#Alternatives).

To devs who want to do weird things to users such as rickrolling users who open devtools in a single-player game probably intending to cheat, it has a tiny disadvantage that the response is not instantaneous: The heartbeat has configurable delay between each pulse to reduce resource usage, and the messages sent to the main thread have to wait for their turn in the main threads event loop before they get to be processed. But there are several configuration options in place to mitigate this: timing parameters and looping through debugger statements instead of just one.

Though the design involves timing execution, it is written such that the detection should not trigger false positives due to busy threads.

## Usage

See [the typings file](https://github.com/david-fong/detect-devtools-via-debugger-heartstop/blob/main/index.d.ts).

## Alternatives

- https://github.com/dsa28s/detect-browser-devtools - uses somewhat specific browser behaviours
- https://github.com/sindresorhus/devtools-detect - compares the page dimensions to the window dimensions

## Some History Readings

- https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open
- https://bugs.chromium.org/p/chromium/issues/detail?id=672625

[npm-version-label]: https://img.shields.io/npm/v/detect-devtools-via-debugger-heartstop.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/detect-devtools-via-debugger-heartstop