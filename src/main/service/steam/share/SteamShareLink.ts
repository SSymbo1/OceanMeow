export interface SteamShareLink<T> {
  shareLinkGenerator: (shareData: T) => string;
}
