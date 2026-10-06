import { DEFAULT_SPANISH_VOICE_URI } from "@/shared/accessibility/accessibility-settings";

function recommendedGoogleVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return (
    voice.lang.toLowerCase() === "es-es" &&
    name.includes("google") &&
    name.includes("espanol")
  );
}

export function selectSpeechVoice(
  available: SpeechSynthesisVoice[],
  voiceURI: string,
  online: boolean,
  preferDefaultVoice = false
) {
  const voices = available.filter((voice) => online || voice.localService);
  if (
    !preferDefaultVoice &&
    voiceURI !== "auto" &&
    voiceURI !== DEFAULT_SPANISH_VOICE_URI
  ) {
    const selected = voices.find((voice) => voice.voiceURI === voiceURI);
    if (selected) return selected;
  }
  return (
    voices.find(recommendedGoogleVoice) ??
    voices.find((voice) => voice.lang.toLowerCase() === "es-es") ??
    voices.find((voice) => voice.lang.toLowerCase() === "es-pe") ??
    voices.find((voice) => voice.lang.toLowerCase() === "es-419") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) ??
    (online ? voices[0] : null) ??
    null
  );
}
