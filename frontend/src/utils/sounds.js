// Sound effects manager for the flashcard app

// Sound file paths
const SOUND_FILES = {
	correct: "/sounds/correct.wav",
	wrong: "/sounds/wrong.wav",
	flip: "/sounds/flip.wav",
	success: "/sounds/success.wav",
	click: "/sounds/click.wav",
	gameOver: "/sounds/game-over.wav",
};

// Cache for Audio objects
const audioCache = {};

// Get or create Audio object
const getAudio = (soundName) => {
	if (!audioCache[soundName]) {
		const path = SOUND_FILES[soundName];
		if (!path) return null;
		audioCache[soundName] = new Audio(path);
		audioCache[soundName].volume = 0.5;
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

	const audio = getAudio(soundName);
	if (audio) {
		audio.currentTime = 0;
		audio.play().catch(() => {
			// Silently catch autoplay errors (browser restrictions)
		});
	}
};

// Set sound volume (0-1)
export const setSoundVolume = (volume) => {
	Object.values(audioCache).forEach((audio) => {
		audio.volume = Math.max(0, Math.min(1, volume));
	});
};

// Preload all sounds
export const preloadSounds = () => {
	Object.keys(SOUND_FILES).forEach((soundName) => {
		const audio = getAudio(soundName);
		if (audio) {
			audio.load();
		}
	});
};

// Sound effect names for easy access
export const SOUNDS = {
	CORRECT: "correct",
	WRONG: "wrong",
	FLIP: "flip",
	SUCCESS: "success",
	CLICK: "click",
	GAME_OVER: "gameOver",
};

export default {
	playSound,
	isSoundEnabled,
	setSoundVolume,
	preloadSounds,
	SOUNDS,
};
