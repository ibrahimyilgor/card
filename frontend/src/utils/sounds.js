// Sound effects manager for the flashcard app

// Sound file paths
const SOUND_FILES = {
	correct: "/sounds/correct.mp3",
	wrong: "/sounds/wrong.mp3",
	flip: "/sounds/flip.mp3",
	success: "/sounds/success.mp3",
};

// Cache for Audio objects (fallback) and decoded AudioBuffer for low-latency playback
const audioCache = {};
const bufferCache = {};
let audioContext = null;
let masterGain = null;

// Get or create Audio object
const getAudio = (soundName) => {
	if (!audioCache[soundName]) {
		const path = SOUND_FILES[soundName];
		if (!path) return null;
		const a = new Audio(path);
		a.preload = "auto";
		a.volume = 0.5;
		// try to prime loading
		try {
			a.load();
		} catch (e) {
			// ignore
		}
		audioCache[soundName] = a;
	}
	return audioCache[soundName];
};

// Check if sound effects are enabled
export const isSoundEnabled = () => {
	return localStorage.getItem("soundEnabled") !== "false";
};

// Play a sound effect
export const playSound = (soundName) => {
	if (!isSoundEnabled()) return;

	// Prefer decoded AudioBuffer playback if available (lower latency)
	try {
		if (audioContext && bufferCache[soundName]) {
			if (audioContext.state === "suspended") {
				// try to resume the context so playback isn't blocked
				audioContext.resume().catch(() => {});
			}
			const src = audioContext.createBufferSource();
			src.buffer = bufferCache[soundName];
			const gain = audioContext.createGain();
			gain.gain.value = 0.5;
			src.connect(gain).connect(masterGain || audioContext.destination);
			src.start(0);
			return;
		}
	} catch (e) {
		// fall through to HTMLAudio fallback
	}

	const audio = getAudio(soundName);
	if (audio) {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	}
};

// Set sound volume (0-1)
export const setSoundVolume = (volume) => {
	Object.values(audioCache).forEach((audio) => {
		audio.volume = Math.max(0, Math.min(1, volume));
	});
};

// Preload all sounds
export const preloadSounds = async () => {
	// Initialize AudioContext lazily on user gesture-supported environments
	try {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			masterGain = audioContext.createGain();
			masterGain.gain.value = 1;
			masterGain.connect(audioContext.destination);
		}

		// Fetch and decode each sound file into bufferCache
		await Promise.all(
			Object.entries(SOUND_FILES).map(async ([key, path]) => {
				try {
					const resp = await fetch(path, { cache: "force-cache" });
					if (!resp.ok) return;
					const arr = await resp.arrayBuffer();
					const decoded = await audioContext.decodeAudioData(arr.slice(0));
					bufferCache[key] = decoded;
				} catch (e) {
					// if decode fails, ensure HTMLAudio is created to at least preload
					const a = getAudio(key);
					try {
						a.load();
					} catch (err) {}
				}
			}),
		);
	} catch (e) {
		// Fallback: create HTMLAudio objects and load them
		Object.keys(SOUND_FILES).forEach((soundName) => {
			const audio = getAudio(soundName);
			if (audio) {
				try {
					audio.load();
				} catch (err) {}
			}
		});
	}
};

// Sound effect names for easy access
export const SOUNDS = {
	CORRECT: "correct",
	WRONG: "wrong",
	FLIP: "flip",
	SUCCESS: "success",
};

export default {
	playSound,
	isSoundEnabled,
	setSoundVolume,
	preloadSounds,
	SOUNDS,
};
