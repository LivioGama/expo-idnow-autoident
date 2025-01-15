import RNIdNowLibraryModule from "./RNIdNowLibraryModule";

export * from "./RNIdNowLibrary.types";

export const startIdent = (token: string): string => {
  return RNIdNowLibraryModule.startIdent(token);
};

export default RNIdNowLibraryModule;
