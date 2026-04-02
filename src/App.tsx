import { useEffect, useMemo, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";

import { CountryList } from "./components/CountryList";
import { CountryMap } from "./components/CountryMap";
import { countries } from "./data/countries";
import { fetchCountriesForDex } from "./services/countryDexApi";
import type { Country } from "./types/country";
import "./App.css";

/**
 * Renders the Country Dex page with a selectable country list and map focus.
 *
 * @returns The main Country Dex application layout.
 */
function App() {
  const [countryCatalog, setCountryCatalog] = useState<Country[]>(countries);
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countries[0].code,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    let isMounted = true;

    /**
     * Loads the country list from remote APIs and applies it to local state.
     */
    async function loadCountryCatalog(): Promise<void> {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedCountries = await fetchCountriesForDex();

        if (!isMounted || loadedCountries.length === 0) {
          return;
        }

        setCountryCatalog(loadedCountries);
        setSelectedCountryCode((currentCode) => {
          return loadedCountries.some((country) => country.code === currentCode)
            ? currentCode
            : loadedCountries[0].code;
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch countries from API.";
        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCountryCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountry: Country = useMemo(() => {
    return (
      countryCatalog.find((country) => country.code === selectedCountryCode) ??
      countryCatalog[0] ??
      countries[0]
    );
  }, [countryCatalog, selectedCountryCode]);

  /**
   * Initializes the native OpenLayers map instance.
   * Runs once on mount and creates the map with the selected country.
   */
  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (mapInstanceRef.current) {
      return;
    }

    const view = new View({
      center: selectedCountry.center,
      zoom: selectedCountry.zoom,
    });

    const targetElement = mapContainerRef.current;

    const map = new Map({
      target: targetElement,
      layers: [new TileLayer({ source: new OSM() })],
      view,
    });

    mapInstanceRef.current = map;
    const resizeObserver = new ResizeObserver(() => {
      map.updateSize();
    });
    resizeObserver.observe(targetElement);
    requestAnimationFrame(() => {
      map.updateSize();
    });

    console.debug("✓ OpenLayers map initialized with", selectedCountry.name);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /**
   * Updates map view center and zoom when selected country changes.
   */
  useEffect(() => {
    if (!mapInstanceRef.current) {
      console.warn("Map instance not available yet");
      return;
    }

    const view = mapInstanceRef.current.getView();
    console.debug("✓ Updating map view to center on", selectedCountry.name);
    view.setCenter(selectedCountry.center);
    view.setZoom(selectedCountry.zoom);
  }, [selectedCountry]);

  return (
    <main className="app-shell">
      <section className="country-panel" aria-label="Country selector">
        <header className="country-panel__header">
          <p className="country-panel__eyebrow">Atlas</p>
          <h1>Country Dex</h1>
          <p className="country-panel__subtitle">
            Pick a flag to center the map on that country.
          </p>
        </header>

        <CountryList
          countries={countryCatalog}
          selectedCountryCode={selectedCountryCode}
          onSelectCountry={setSelectedCountryCode}
        />

        {isLoading ? (
          <p className="country-panel__status">
            Loading countries from APIs...
          </p>
        ) : null}
        {loadError ? (
          <p className="country-panel__status is-error">{loadError}</p>
        ) : null}
      </section>

      <section className="map-panel" aria-label="Country map">
        <CountryMap country={selectedCountry}>
          <div className="country-map__target" ref={mapContainerRef} />
        </CountryMap>
      </section>
    </main>
  );
}

export default App;
