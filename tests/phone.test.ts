import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone } from "@/lib/validation/phone";

describe("normalizePhone", () => {
  it.each([
    ["0300 1234567", "+923001234567"],
    ["0300-1234567", "+923001234567"],
    ["03001234567", "+923001234567"],
    ["3001234567", "+923001234567"],
    ["+92 300 1234567", "+923001234567"],
    ["0092 300 1234567", "+923001234567"],
    ["923001234567", "+923001234567"],
    ["021 34567890", "+922134567890"],
    ["+92 21 111 000 061", "+9221111000061"],
    ["021-111-000-061", "+9221111000061"],
    ["+44 20 7946 0000", "+442079460000"],
    ["+1 (415) 555-0100", "+14155550100"],
  ])("normalises %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "12", "abc", "0300 12345", "+92 300 12345678901", "+0 123 456 789", "++923001234567"])(
    "rejects %s",
    (input) => {
      expect(normalizePhone(input)).toBeNull();
    },
  );
});

describe("formatPhone", () => {
  it("groups Pakistani mobile numbers", () => {
    expect(formatPhone("+923001234567")).toBe("+92 300 1234567");
  });
  it("leaves other numbers untouched", () => {
    expect(formatPhone("+442079460000")).toBe("+442079460000");
  });
});
