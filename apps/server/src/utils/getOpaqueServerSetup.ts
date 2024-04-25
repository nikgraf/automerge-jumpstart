export const getOpaqueServerSetup = () => {
  const serverSetup = process.env.OPAQUE_SERVER_SETUP;
  if (serverSetup == null) {
    console.error(process.env);
    throw new Error("OPAQUE_SERVER_SETUP env variable is not set");
  }
  return serverSetup;
};
