import assert from "node:assert/strict";
import test from "node:test";
import { MODULE3_SESSIONS } from "../shared/learning/module3-journey";
import {
  clearReadingPositions,
  readPosition,
  READING_POSITION_PREFIX,
  setReadingOwner,
  writePosition,
  rememberModule3Session,
  readModule3Resume
} from "../shared/learning/reading-position";

test("numeric bookmarks restore and clamp without storing lesson completion", () => {
  const values = new Map<string, string>();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      get length() {
        return values.size;
      },
      key: (index: number) => [...values.keys()][index] ?? null,
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key)
    }
  });
  try {
    assert.equal(readPosition("step", 3), 0);
    writePosition("step", 3);
    assert.equal(readPosition("step", 3), 3);
    assert.equal(readPosition("step", 1), 1);
    for (const invalid of ["null", "-1", '"2"', "1.5", "broken"]) {
      values.set(READING_POSITION_PREFIX + "step", invalid);
      assert.equal(readPosition("step", 3), 0);
    }
    setReadingOwner("first");
    const allowed = MODULE3_SESSIONS.map((session) => session.id);
    rememberModule3Session(MODULE3_SESSIONS[2].id);
    assert.equal(readModule3Resume(allowed, "first")?.id, MODULE3_SESSIONS[2].id);
    assert.equal(readModule3Resume(allowed, "another"), null);
    assert.equal(readModule3Resume([MODULE3_SESSIONS[0].id]), null);
    rememberModule3Session("untrusted-id");
    assert.equal(readModule3Resume(allowed)?.order, 3);
    writePosition("last-session", 999);
    assert.equal(readModule3Resume(allowed), null);
    writePosition("step", 2);
    setReadingOwner("first");
    assert.equal(readPosition("step", 3), 2);
    setReadingOwner("second");
    assert.equal(readPosition("step", 3), 0);
    values.set("unrelated", "keep");
    writePosition("pdf:guide", 2);
    clearReadingPositions();
    assert.equal(readModule3Resume(allowed), null);
    assert.equal(readPosition("pdf:guide", 3), 0);
    assert.equal(values.get("unrelated"), "keep");
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("blocked storage never prevents reading", () => {
  assert.equal(readPosition("missing", 3), 0);
  assert.doesNotThrow(() => writePosition("step", 1));
  assert.doesNotThrow(clearReadingPositions);
});
