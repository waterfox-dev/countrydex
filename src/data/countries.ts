import type { Country } from '../types/country'

import { buildFlagUrl } from '../services/countryDexApi'

/**
 * Static country catalog used by the Country Dex list.
 */
export const countries: Country[] = [
    {
        code: 'US',
        name: 'United States',
        flagUrl: buildFlagUrl('US'),
        center: [-10997148, 4569099],
        zoom: 4,
    },
    {
        code: 'FR',
        name: 'France',
        flagUrl: buildFlagUrl('FR'),
        center: [261845, 6250562],
        zoom: 5,
    },
    {
        code: 'JP',
        name: 'Japan',
        flagUrl: buildFlagUrl('JP'),
        center: [15478929, 4257980],
        zoom: 5,
    },
    {
        code: 'BR',
        name: 'Brazil',
        flagUrl: buildFlagUrl('BR'),
        center: [-5754253, -1435360],
        zoom: 4,
    },
    {
        code: 'ZA',
        name: 'South Africa',
        flagUrl: buildFlagUrl('ZA'),
        center: [2741394, -3364385],
        zoom: 5,
    },
    {
        code: 'AU',
        name: 'Australia',
        flagUrl: buildFlagUrl('AU'),
        center: [14962684, -3006800],
        zoom: 4,
    },
]
