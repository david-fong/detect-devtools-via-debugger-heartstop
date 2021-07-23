# 💞🐛 Detect Devtools Via Debugger Heartstop

[![npm version][npm-version-label]][npm-url]

Detects whether the browser's devtools are open. It opens a web worker with a polling loop that sends pulses to the main thread. Each pulse is two messages with a debugger statement in between them, which will create an abnormal delay between enclosing messages when devtools are opened on any browser that implements debugging workers and enables debugging always-if-and-only-if the devtools are opened.

This has the benefit over other implementations that it doesn't depend on whether the devtools pane is attached to the browser window, or other deeply browser-internal behaviours such as lazy console logging of complex objects, which are much more subject to change.

It has a disadvantage that the response is not instantaneous: The heartbeat has configurable delay between each pulse to reduce resource usage, and the messages sent to the main thread have to wait for their turn in the main threads event loop before they get to be processed. For slow timings, it would be more possible to bypass the detection by quickly continuing execution of the debugger.

Though the design involves timing execution, it is written such that the detection should not trigger false positives due to busy threads.

## Usage

See [the typings file](https://github.com/david-fong/detect-devtools-via-debugger-heartstop/blob/main/index.d.ts).

[npm-version-label]: https://img.shields.io/npm/v/detect-devtools-via-debugger-heartstop.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/detect-devtools-via-debugger-heartstop