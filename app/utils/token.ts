import { DEFAULT_SOURCE } from "@/app/constant";

export function estimateTokenLength(input: string): number {
  let tokenLength = 0;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25;
      } else {
        tokenLength += 0.5;
      }
    } else {
      // Unicode character
      tokenLength += 1.5;
    }
  }

  return tokenLength;
}

export const makePayload = (params: Record<string, any>) => {
  const { user_id: userId = "" } = params || {};
  const payload = {
    user_id: userId,
    source: DEFAULT_SOURCE,
    ip: "",
    agent: "",
  };

  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
};
