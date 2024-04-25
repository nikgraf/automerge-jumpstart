export const removeLocalDb = () => {
  indexedDB.deleteDatabase("automerge");
};
