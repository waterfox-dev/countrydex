import { fromLonLat } from 'ol/proj'

import type { Country } from '../types/country'

interface RestCountry {
	cca2: string
	name: {
		common: string
	}
	latlng?: number[]
}

const COUNTRY_API_URL = 'https://restcountries.com/v3.1/all?fields=cca2,name,latlng'
const FLAG_API_BASE_URL = 'https://flagcdn.com/w80'

/**
 * Builds a flag URL for a country code using a specialized flag CDN.
 *
 * @param countryCode Two-letter country code.
 * @returns Flag image URL.
 */
export function buildFlagUrl(countryCode: string): string {
	return `${FLAG_API_BASE_URL}/${countryCode.toLowerCase()}.png`
}

/**
 * Converts WGS84 latitude/longitude values into Web Mercator coordinates.
 *
 * @param lat Latitude in degrees.
 * @param lng Longitude in degrees.
 * @returns Center point in EPSG:3857.
 */
function toWebMercatorCenter(lat: number, lng: number): [number, number] {
	const [x, y] = fromLonLat([lng, lat])
	return [x, y]
}

/**
 * Fetches country metadata and geographic centers from a country-focused API.
 *
 * @returns List of countries compatible with Country Dex rendering.
 */
export async function fetchCountriesForDex(): Promise<Country[]> {
	const response = await fetch(COUNTRY_API_URL)

	if (!response.ok) {
		throw new Error(`Country API request failed with status ${response.status}.`)
	}

	const payload = (await response.json()) as RestCountry[]

	return payload
		.filter((country) => {
			return Boolean(country.cca2 && country.name?.common) && Array.isArray(country.latlng) && country.latlng.length >= 2
		})
		.map((country) => {
			const [lat, lng] = country.latlng as [number, number]

			return {
				code: country.cca2,
				name: country.name.common,
				flagUrl: buildFlagUrl(country.cca2),
				center: toWebMercatorCenter(lat, lng),
				zoom: 5,
			}
		})
		.sort((a, b) => a.name.localeCompare(b.name))
}
