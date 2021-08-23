# 💞🐛 Detect Devtools Via Debugger Heartstop

[![npm version][npm-version-label]][npm-url]

Detects whether the browser's devtools are open. ([demo](https://david-fong.github.io/detect-devtools-via-debugger-heartstop/))

## How It Works

1. Main thread sends a message to a webworker thread.
1. Worker thread replies with an opening heartbeat.
1. Main thread reacts by starting a timer to expect the closing heartbeat.
1. Worker thread's message handler encounters a debugger statement.
1. If devtools are closed, the worker will immediately send an acknowledgement to the main thread, and the main thread conclude that devtools are closed.
1. If devtools are opened, the _worker_ will enter a debugging session, and the main thread will timeout waiting for the response, concluding that the debugger must be open. The main thread will _not_ be blocked by the worker's debugging session, but it's timeout _response_ will be blocked by any heavy processing in the main thread ahead of it in the event queue.

This was a fun challenge to tackle. If this solution sounds overly complex, take a look through [the listed alternatives](#Alternatives). It's a pretty fascinating rabbit hole.

## Pros and Cons

### Cons

🚨 To devs who want some custom browser hooks for their own purposes, _this is not for you_. You will hate it. It will enter debugging for the worker thread whenever devtools are opened, which (in most browsers) also causes the console context to change to the worker's context. Simply continuing the debugger will result in the debugger activating again, and the only way around this is to use the browser's inbuilt mechanism to disable all breakpoints (which may need to be done _each_ time opening the devtools depending on whether your browser remembers the setting). Scroll down for [links to alternatives](#Alternatives).

It can get messed up when certain debugger statements are placed in the main thread. I have not yet tested out what the rules for this are, nor am I really interested in doing so 😅.

### Pros

This is well suited for devs who want to do silly/weird things to users such as rickrolling people who open devtools in a browser game, and don't mind absolutely destroying the usability/ergonomics of the devtools. In fact, this was the very kind of spirit for which I created this.

This has the benefit over other implementations that it doesn't depend on whether the devtools pane is attached to the browser window, or other deeply browser-internal behaviours such as lazy console logging of complex objects, which are much more subject to change.

Though the design involves timing program execution, it is written such that the detection should never trigger false positives due to busy threads, given a reasonable main thread timeout value.

## Usage

See [the typings file](https://github.com/david-fong/detect-devtools-via-debugger-heartstop/blob/main/index.d.ts), or visit [the demo page](https://david-fong.github.io/detect-devtools-via-debugger-heartstop/).

## Alternatives

- https://github.com/dsa28s/detect-browser-devtools - uses somewhat specific browser behaviours
- https://github.com/sindresorhus/devtools-detect - compares the page dimensions to the window dimensions

You may also have luck sifting through the below StackOverflow thread. For example, one simple but non-robust way to do it is to hook into keyboard shortcuts.

## Some History Readings

- https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open
- https://bugs.chromium.org/p/chromium/issues/detail?id=672625

[npm-version-label]: https://img.shields.io/npm/v/detect-devtools-via-debugger-heartstop.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/detect-devtools-via-debugger-heartstop