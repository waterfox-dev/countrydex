import type { PropsWithChildren } from "react";

import type { Country } from "../types/country";

interface CountryMapProps extends PropsWithChildren {
  country: Country;
}

/**
 * Wraps the OpenLayers map and displays the active country context.
 *
 * @param props Component props with the selected country and map content.
 * @returns The map panel with country title and coordinates.
 */
export function CountryMap({ country, children }: CountryMapProps) {
  return (
    <div className="country-map">
      <header className="country-map__header">
        <p className="country-map__eyebrow">Selected</p>
        <h2 className="country-map__title">
          <img
            className="country-map__flag"
            src={country.flagUrl}
            alt={`${country.name} flag`}
          />
          <span>{country.name}</span>
        </h2>
      </header>

      <div className="country-map__frame">
        {children}
      </div>
    </div>
  );
}
