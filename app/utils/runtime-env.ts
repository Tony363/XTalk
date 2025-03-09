export const isFormal = () => {
  return process.env.NEXT_PUBLIC_RUNTIME_ENV === "formal";
};

export const isTest = () => {
  return process.env.NEXT_PUBLIC_RUNTIME_ENV === "test";
};

export const isLocal = () => {
  return process.env.NEXT_PUBLIC_RUNTIME_ENV === "local";
};
