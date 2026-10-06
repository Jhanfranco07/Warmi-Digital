import assert from "node:assert/strict";
import test from "node:test";
import { selectSpeechVoice } from "@/shared/accessibility/speech-voice";
import { DEFAULT_SPANISH_VOICE_URI } from "@/shared/accessibility/accessibility-settings";

function voice(name: string, lang: string, localService: boolean): SpeechSynthesisVoice {
  return { name, lang, localService, voiceURI: name, default: false };
}
const google = voice("Google español", "es-ES", false);
const local = voice("Español del dispositivo", "es-ES", true);

test("recommended Google Spanish is preferred online", () => {
  assert.equal(
    selectSpeechVoice([local, google], DEFAULT_SPANISH_VOICE_URI, true),
    google
  );
});
test("offline selects Google only when supplied locally", () => {
  assert.equal(
    selectSpeechVoice([local, google], DEFAULT_SPANISH_VOICE_URI, false),
    local
  );
  const installedGoogle = { ...google, localService: true };
  assert.equal(
    selectSpeechVoice([local, installedGoogle], DEFAULT_SPANISH_VOICE_URI, false),
    installedGoogle
  );
});
test("lesson preference restores the default without overwriting saved choices elsewhere", () => {
  assert.equal(selectSpeechVoice([local, google], local.voiceURI, true), local);
  assert.equal(selectSpeechVoice([local, google], local.voiceURI, true, true), google);
});
test("offline never falls back to remote or non-Spanish voices", () => {
  assert.equal(selectSpeechVoice([google], DEFAULT_SPANISH_VOICE_URI, false), null);
  assert.equal(
    selectSpeechVoice(
      [voice("English", "en-US", true)],
      DEFAULT_SPANISH_VOICE_URI,
      false
    ),
    null
  );
});
