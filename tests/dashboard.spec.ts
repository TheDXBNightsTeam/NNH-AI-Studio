import { test, expect } from "@playwright/test";

test("Dashboard basic UI works", async ({ page }) => {
  await page.goto("http://localhost:5050/dashboard");

  // تحقق أن لوحة التحكم تفتح فعلاً
  await expect(page.getByText("AI Command Center")).toBeVisible();

  // تحقق من وجود زر "Sync Now"
  const syncButton = page.getByRole("button", { name: "Sync Now" });
  await expect(syncButton).toBeVisible();

  // اضغط على الزر
  await syncButton.click();

  // تحقق أن حالة الاتصال ظهرت بعد الضغط
  await expect(page.getByText("Connected")).toBeVisible();
});