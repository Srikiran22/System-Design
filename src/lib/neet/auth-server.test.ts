// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
import crypto from "node:crypto";
import {
  AuthError,
  hashPassword,
  verifyPassword,
  signDevToken,
  verifyDevToken,
  isLocalDevAuthAllowed,
} from "./auth-server";
import { isValidCalendarDate } from "./account.functions";

function base64Url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

describe("Server Authentication & Security Invariants (Phase 0)", () => {
  const origNodeEnv = process.env["NODE_ENV"];
  const origSupaUrl = process.env["SUPABASE_URL"];
  const origSupaKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const origAllowLocal = process.env["ALLOW_LOCAL_DEV_AUTH"];

  afterEach(() => {
    process.env["NODE_ENV"] = origNodeEnv;
    if (origSupaUrl === undefined) delete process.env["SUPABASE_URL"];
    else process.env["SUPABASE_URL"] = origSupaUrl;
    if (origSupaKey === undefined) delete process.env["SUPABASE_PUBLISHABLE_KEY"];
    else process.env["SUPABASE_PUBLISHABLE_KEY"] = origSupaKey;
    if (origAllowLocal === undefined) delete process.env["ALLOW_LOCAL_DEV_AUTH"];
    else process.env["ALLOW_LOCAL_DEV_AUTH"] = origAllowLocal;
  });

  describe("Password hashing (salted scrypt + timingSafeEqual)", () => {
    it("hashes with unique random salt and verifies valid passwords only", () => {
      const h1 = hashPassword("CorrectHorseBatteryStaple!");
      const h2 = hashPassword("CorrectHorseBatteryStaple!");

      expect(h1).not.toBe(h2);
      expect(h1).not.toContain("CorrectHorseBatteryStaple!");
      expect(verifyPassword("CorrectHorseBatteryStaple!", h1)).toBe(true);
      expect(verifyPassword("CorrectHorseBatteryStaple!", h2)).toBe(true);
      expect(verifyPassword("wrong-password", h1)).toBe(false);
      expect(verifyPassword("", h1)).toBe(false);
      expect(verifyPassword("CorrectHorseBatteryStaple!", "malformed-hash")).toBe(false);
    });
  });

  describe("Dev HMAC-SHA256 session tokens", () => {
    it("signs and verifies a valid HS256 dev token", () => {
      const userId = crypto.randomUUID();
      const token = signDevToken({ sub: userId, email: "engineer@example.com" });
      const verified = verifyDevToken(token);

      expect(verified).not.toBeNull();
      expect(verified.sub).toBe(userId);
      expect(verified.email).toBe("engineer@example.com");
      expect(verified.iss).toBe("neet-local-dev");
    });

    it("explicitly rejects alg:none unsigned tokens", () => {
      const fakeHeader = base64Url({ alg: "none", typ: "JWT" });
      const fakePayload = base64Url({
        sub: crypto.randomUUID(),
        email: "attacker@example.com",
        iss: "neet-local-dev",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      const unsignedToken = `${fakeHeader}.${fakePayload}.`;
      expect(() => verifyDevToken(unsignedToken)).toThrow(AuthError);
      expect(() => verifyDevToken(`${fakeHeader}.${fakePayload}.fakesig`)).toThrow(AuthError);
    });

    it("rejects tampered payload or tampered signature", () => {
      const token = signDevToken({ sub: crypto.randomUUID(), email: "alice@example.com" });
      const [h, p, s] = token.split(".");
      const tamperedPayload = base64Url({
        sub: crypto.randomUUID(),
        email: "admin@example.com",
        iss: "neet-local-dev",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      expect(() => verifyDevToken(`${h}.${tamperedPayload}.${s}`)).toThrow(AuthError);
      expect(() => verifyDevToken(`${h}.${p}.invalidsignature`)).toThrow(AuthError);
    });

    it("rejects expired tokens and non-UUID subjects", () => {
      const expired = signDevToken({ sub: crypto.randomUUID(), email: "old@example.com" }, -10);
      expect(() => verifyDevToken(expired)).toThrow(AuthError);

      expect(() => signDevToken({ sub: "not-a-uuid", email: "bad@example.com" })).toThrow(
        AuthError,
      );
    });
  });

  describe("Environment trust boundary (fail-closed in production)", () => {
    it("disables local dev auth whenever NODE_ENV is production", () => {
      process.env["NODE_ENV"] = "production";
      delete process.env["SUPABASE_URL"];
      delete process.env["SUPABASE_PUBLISHABLE_KEY"];
      process.env["ALLOW_LOCAL_DEV_AUTH"] = "true";

      expect(isLocalDevAuthAllowed()).toBe(false);
    });

    it("disables local dev auth whenever Supabase is configured", () => {
      process.env["NODE_ENV"] = "development";
      process.env["SUPABASE_URL"] = "https://example.supabase.co";
      process.env["SUPABASE_PUBLISHABLE_KEY"] = "sb_publishable_test_key";
      process.env["ALLOW_LOCAL_DEV_AUTH"] = "true";

      expect(isLocalDevAuthAllowed()).toBe(false);
    });
  });

  describe("Input validation", () => {
    it("validates real Gregorian calendar dates strictly", () => {
      expect(isValidCalendarDate("2026-11-05")).toBe(true);
      expect(isValidCalendarDate("2024-02-29")).toBe(true); // leap year
      expect(isValidCalendarDate("2026-02-29")).toBe(false); // non-leap year
      expect(isValidCalendarDate("2026-02-31")).toBe(false);
      expect(isValidCalendarDate("2026-13-01")).toBe(false);
      expect(isValidCalendarDate("not-a-date")).toBe(false);
    });
  });
});
