export const StorageKey = 'BNGEnabledSites';

export interface ISite {
  /**
   * Site icon
   */
  icon: string;
  /**
   * Site title
   */
  title: string;
  /**
   * Site url
   */
  url: string;
}

export interface ISiteData {
  /**
   * Noti groups
   */
  groups: Array<{
    name: string;
    users: string[];
  }>
  /**
   * Selected noti group
   */
  selected: number;
  /**
   * Auto select noti groups
   */
  auto: number[];
};