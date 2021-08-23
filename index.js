"use strict";
/// <reference types="./index.d.ts"/>
/** @typedef {{ moreDebugs: number }} PulseCall */
/** @typedef {{ isOpenBeat: boolean }} PulseAck */

(() => {
	/** @type {DevtoolsDetectorConfig} */
	const config = {
		pollingIntervalSeconds: 0.25,
		maxMillisBeforeAckWhenClosed: 100,
		moreAnnoyingDebuggerStatements: 1,

		onDetectOpen: undefined,
		onDetectClose: undefined,

		startup: "asap",
		onCheckOpennessWhilePaused: "returnStaleValue",
	};
	Object.seal(config);

	const heart = new Worker(URL.createObjectURL(new Blob([
// Note: putting everything before the first debugger on the same line as the
// opening callback brace prevents a user from placing their own debugger on
// a line before the first debugger and taking control in that way.
`"use strict";
onmessage = (ev) => { postMessage({isOpenBeat:true});
	debugger; for (let i = 0; i < ev.data.moreDebugs; i++) { debugger; }
	postMessage({isOpenBeat:false});
};`
	], { type: "text/javascript" })));

	let _isDevtoolsOpen = false;
	let _isDetectorPaused = true;

	// @ts-expect-error
	// note: leverages that promises can only resolve once.
	/**@type {function (boolean | null): void}*/ let resolveVerdict = undefined;
	/**@type {number}*/ let nextPulse$ = NaN;

	const onHeartMsg = (/** @type {MessageEvent<PulseAck>}*/ msg) => {
		if (msg.data.isOpenBeat) {
			/** @type {Promise<boolean | null>} */
			let p = new Promise((_resolveVerdict) => {
				resolveVerdict = _resolveVerdict;
				let wait$ = setTimeout(
					() => { wait$ = NaN; resolveVerdict(true); },
					config.maxMillisBeforeAckWhenClosed + 1,
				);
			});
			p.then((verdict) => {
				if (verdict === null) return;
				if (verdict !== _isDevtoolsOpen) {
					_isDevtoolsOpen = verdict;
					const cb = { true: config.onDetectOpen, false: config.onDetectClose }[verdict+""];
					if (cb) cb();
				}
				nextPulse$ = setTimeout(
					() => { nextPulse$ = NaN; doOnePulse(); },
					config.pollingIntervalSeconds * 1000,
				);
			});
		} else {
			resolveVerdict(false);
		}
	};

	const doOnePulse = () => {
		heart.postMessage({ moreDebugs: config.moreAnnoyingDebuggerStatements });
	}

	/** @type {DevtoolsDetector} */
	const detector = {
		config,
		get isOpen() {
			if (_isDetectorPaused && config.onCheckOpennessWhilePaused === "throw") {
				throw new Error("`onCheckOpennessWhilePaused` is set to `\"throw\"`.")
			}
			return _isDevtoolsOpen;
		},
		get paused() { return _isDetectorPaused; },
		set paused(pause) {
			// Note: a simpler implementation is to skip updating results in the
			// ack callback. The current implementation conserves resources when
			// paused.
			if (_isDetectorPaused === pause) { return; }
			_isDetectorPaused = pause;
			if (pause) {
				heart.removeEventListener("message", onHeartMsg);
				clearTimeout(nextPulse$); nextPulse$ = NaN;
				resolveVerdict(null);
			} else {
				heart.addEventListener("message", onHeartMsg);
				doOnePulse();
			}
		}
	};
	Object.freeze(detector);
	// @ts-expect-error
	globalThis.devtoolsDetector = detector;

	switch (config.startup) {
		case "manual": break;
		case "asap": detector.paused = false; break;
		case "domContentLoaded": {
			if (document.readyState !== "loading") {
				detector.paused = false;
			} else {
				document.addEventListener("DOMContentLoaded", (ev) => {
					detector.paused = false;
				}, { once: true });
			}
			break;
		}
	}
})();