import "jest";
import { newMessageHeader } from "../api/newFunction";

describe("test message headers", () => {
  it("should have default values", async () => {
    let messageHeader = newMessageHeader("test", "test");

    expect(messageHeader.id.length).toBeGreaterThan(30);
    expect(messageHeader.timestamp.length).toBeGreaterThan(10);
  });
});
