import { describe, expect, it } from "vitest";
import { cn } from "../src/ui/shared/utils";

describe("cn (className utility)", () => {
	it("should merge single class", () => {
		expect(cn("foo")).toBe("foo");
	});

	it("should merge multiple classes", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("should handle conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
	});

	it("should handle undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});

	it("should merge conflicting Tailwind classes (last wins)", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
		expect(cn("bg-black", "bg-white")).toBe("bg-white");
	});

	it("should handle object syntax", () => {
		expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
	});

	it("should handle array syntax", () => {
		expect(cn(["foo", "bar"])).toBe("foo bar");
	});

	it("should handle complex mixed inputs", () => {
		expect(
			cn(
				"base-class",
				{ conditional: true, hidden: false },
				["array-class"],
				undefined,
				"final-class",
			),
		).toBe("base-class conditional array-class final-class");
	});

	it("should properly merge Tailwind flex classes", () => {
		expect(cn("flex-row", "flex-col")).toBe("flex-col");
	});

	it("should properly merge Tailwind spacing classes", () => {
		expect(cn("m-2", "m-4")).toBe("m-4");
		expect(cn("mx-2", "mx-4")).toBe("mx-4");
		expect(cn("mt-2", "mt-4")).toBe("mt-4");
	});

	it("should keep non-conflicting classes", () => {
		expect(cn("p-2", "m-4")).toBe("p-2 m-4");
		expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
	});
});
