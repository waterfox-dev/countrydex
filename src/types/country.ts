/**
 * Describes a country item that can be displayed and focused on the map.
 */
export interface Country {
  /**
   * ISO-style short code used as a unique key.
   */
  code: string

  /**
   * Display name of the country.
   */
  name: string

  /**
   * Flag image URL from a dedicated flag API.
   */
  flagUrl: string

  /**
   * Center coordinate in Web Mercator (EPSG:3857).
   */
  center: [number, number]

  /**
   * Suggested zoom level when this country is selected.
   */
  zoom: number
}
