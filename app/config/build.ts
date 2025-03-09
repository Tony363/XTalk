const getSystemConfigs = () => {
  const systemConfigs = process.env.SYSTEM_CONFIGS;
  try {
    return JSON.parse(systemConfigs as string);
  } catch (error: unknown) {}
  return {};
};

export const getBuildConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  return {
    system: getSystemConfigs(),
  };
};

export type BuildConfig = ReturnType<typeof getBuildConfig>;
