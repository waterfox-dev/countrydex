import type { Country } from "../types/country";

interface CountryListProps {
  countries: Country[];
  selectedCountryCode: string;
  onSelectCountry: (countryCode: string) => void;
}

/**
 * Displays a selectable list of countries with their flags.
 *
 * @param props Component props containing countries and selection handlers.
 * @returns The rendered country selection list.
 */
export function CountryList({
  countries,
  selectedCountryCode,
  onSelectCountry,
}: CountryListProps) {
  function handleCountrySelect(country: Country) {
    window.dataLayer?.push({
      event: "select_country",
      country_name: country.name,
      country_code: country.code,
    });

    onSelectCountry(country.code);
  }

  return (
    <ul className="country-list" role="listbox" aria-label="Countries">
      {countries.map((country) => {
        const isSelected = country.code === selectedCountryCode;

        return (
          <li key={country.code}>
            <button
              className={`country-list__item ${isSelected ? "is-selected" : ""}`}
              type="button"
              aria-selected={isSelected}
              onClick={() => handleCountrySelect(country)}
            >
              <img
                className="country-list__flag"
                src={country.flagUrl}
                alt={`${country.name} flag`}
                loading="lazy"
              />
              <span>{country.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
