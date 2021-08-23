"use strict";
/// <reference types="./index.d.ts"/>
(() => {
	const main = document.getElementsByTagName("main").item(0);
	/**@type {(isOpen:boolean) => void}*/let renderIsOpen = (isOpen) => {};
	{
		const status = document.createElement("div");
		status.style.display = "grid";
		{
			const wrap = document.createElement("div");
			{
				const label = document.createElement("label");
				label.textContent = "devtoolsDetector.isOpen: ";
				wrap.appendChild(label);
			}{
				const isOpen = document.createElement("output");
				const f = document.createTextNode("false");
				const t = document.createElement("span");
				{
					const emoji = (/**@type {string}*/text) => {
						const el = document.createElement("div");
						el.classList.add("dancing-emoji");
						el.textContent = text;
						return el;
					};
					t.appendChild(emoji("🕺"));
					t.appendChild(document.createTextNode("true"));
					t.appendChild(emoji("💃"));
				}
				renderIsOpen = (val) => {
					isOpen.replaceChild((val ? t : f), isOpen.firstChild);
				};
				isOpen.appendChild(f);
				wrap.appendChild(isOpen);
			}
			status.appendChild(wrap);
		}{
			const label = document.createElement("label");
			label.textContent = "devtoolsDetector.paused";
			const pause = document.createElement("input");
			pause.type = "checkbox";
			pause.onchange = (ev) => { devtoolsDetector.paused = pause.checked; };
			label.appendChild(pause);
			status.appendChild(label);
		}
		main?.append(status);
	}

	const form = document.createElement("fieldset");
	Object.assign(form.style, {
		contain: "content", position: "relative",
		display: "flex", flexFlow: "column",
	});
	{
		const legend = document.createElement("legend");
		legend.textContent = "devtoolsDetector.config";
		form.appendChild(legend);
	}
	const fields = {
		pollingIntervalSeconds: { type: "number", default: 1.0, min: 0 },
		maxMillisBeforeAckWhenClosed: { type: "number", default: 100, min: 0 },
		moreAnnoyingDebuggerStatements: { type: "number", default: 0, min: 0 },

		onDetectOpen: { type: "eval-js" },
		onDetectClose: { type: "eval-js" },

		startup: {
			type: "select", options: ["manual", "asap", "domContentLoaded"], default: "asap",
		},
		onCheckOpennessWhilePaused: {
			type: "select", options: ["returnStaleValue", "throw"], default: "returnStaleValue",
		},
	};
	Object.keys(fields).forEach((field) => {
		// @ts-expect-error
		const desc = fields[field];
		const label = document.createElement("label");
		label.textContent = field + ": ";

		if (desc.type === "select") {
			const sel = document.createElement("select");
			for (const optName of desc.options) {
				const opt = document.createElement("option");
				opt.value = optName;
				opt.text = optName;
				sel.appendChild(opt);
			}
			sel.value = desc.default;
			sel.onchange = (ev) => {
				devtoolsDetector.config[field] = sel.value || desc.default;
			};
			label.appendChild(sel);

		} else if (desc.type === "eval-js") {
			const area = document.createElement("textarea");
			area.style.display = "grid";
			area.placeholder = "< something to eval() >";
			area.onchange = (ev) => {
				devtoolsDetector.config[field] = () => {
					renderIsOpen(devtoolsDetector.isOpen);
					try {
						eval(area.value);
					} catch (err) {
						alert(err.message + "\n\n " + err.stack);
					}
				};
			};
			area.dispatchEvent(new Event("change"));
			label.appendChild(area);

		} else {
			const input = document.createElement("input");
			input.type = desc.type;
			input.min = desc.min;
			input.placeholder = desc.default;
			input.value = desc.default;
			input.onchange = (ev) => {
				devtoolsDetector.config[field] = input.value ?? desc.default;
			};
			label.appendChild(input);
		}
		form.appendChild(label);
	});
	main?.appendChild(form);

	/* const rr = document.createElement("iframe");
	Object.assign(rr, {
		width: "300", height: "150",
		src: "https://www.youtube.com/embed/iik25wqIuFo?disablekb=1&fs=0&modestbranding=1&controls=0",
		title: "🕺💃",
		allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
		allowFullScreen: false,
	});
	main?.appendChild(rr); */
})();