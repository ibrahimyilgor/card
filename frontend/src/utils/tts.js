const DEFAULT_LANG = "en-US";

function findVoice(lang) {
	if (!window.speechSynthesis) return null;
	const voices = window.speechSynthesis.getVoices();
	if (!voices || !voices.length) return null;
	// prefer exact match, then prefix match
	let v = voices.find((x) => x.lang === lang);
	if (v) return v;
	v = voices.find((x) => x.lang && x.lang.startsWith(lang.split("-")[0]));
	return v || voices[0];
}

let currentUtterance = null;

function speak(text, opts = {}) {
	const lang = opts.lang || DEFAULT_LANG;
	if (!window.speechSynthesis)
		return Promise.reject(new Error("SpeechSynthesis not supported"));

	// refresh voices (some browsers load them async)
	const voices = window.speechSynthesis.getVoices();

	return new Promise((resolve, reject) => {
		stop();

		const utter = new SpeechSynthesisUtterance(text);
		currentUtterance = utter;
		utter.lang = lang;
		if (opts.rate) utter.rate = opts.rate;
		if (opts.pitch) utter.pitch = opts.pitch;

		// try to pick a voice
		const voice = findVoice(lang);
		if (voice) utter.voice = voice;

		utter.onend = () => {
			if (currentUtterance === utter) currentUtterance = null;
			resolve();
		};
		utter.onerror = (err) => {
			if (currentUtterance === utter) currentUtterance = null;
			reject(err || new Error("TTS error"));
		};

		try {
			window.speechSynthesis.speak(utter);
		} catch (e) {
			if (currentUtterance === utter) currentUtterance = null;
			reject(e);
		}
	});
}

function stop() {
	if (!window.speechSynthesis) return;
	try {
		window.speechSynthesis.cancel();
	} catch (e) {
		// ignore
	}
	currentUtterance = null;
}

function isSpeaking() {
	if (!window.speechSynthesis) return false;
	return window.speechSynthesis.speaking;
}

export default {
	speak,
	stop,
	isSpeaking,
};
