// An end-to-end test the way real teams write it (Playwright). Illustrative — needs `npm i -D @playwright/test`.
// The zero-dependency version of the same idea is ui/smoke_test.py. (Lesson 10)
import { test, expect } from "@playwright/test";

test("the board loads and enrols a student", async ({ page }) => {
  await page.goto("http://127.0.0.1:8000/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Notice Board");
  await expect(page.locator("#student-list .card")).toHaveCount(5);
  await page.getByLabel("Name").fill("Zoya");
  await page.getByLabel("Class").selectOption("3B");
  await page.getByRole("button", { name: "Enrol" }).click();
  await expect(page.getByRole("alert")).toContainText("Zoya is on the board");
  await expect(page.locator("#student-list .card")).toHaveCount(6);
});

test("keyboard users can reach the form", async ({ page }) => {
  await page.goto("http://127.0.0.1:8000/");
  await page.keyboard.press("Tab");                      // the skip link appears first
  await expect(page.locator(".skip")).toBeFocused();
});
