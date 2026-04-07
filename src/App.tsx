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
 * Renders the Country Dex page: an interactive tool to identify countries per flags.
 * Features an OpenLayers map that centers on the selected national flag.
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
  const selectedCountryCodeRef = useRef(selectedCountryCode);
  const lastMapScrollEventAtRef = useRef(0);

  useEffect(() => {
    selectedCountryCodeRef.current = selectedCountryCode;
  }, [selectedCountryCode]);

  useEffect(() => {
    let isMounted = true;

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

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) {
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

    function handleMapWheelScroll() {
      const now = Date.now();
      if (now - lastMapScrollEventAtRef.current < 1000) return;
      lastMapScrollEventAtRef.current = now;
      window.dataLayer?.push({
        event: "country_map_scroll",
        selected_country_code: selectedCountryCodeRef.current,
        map_zoom: Number(map.getView().getZoom()?.toFixed(2) ?? 0),
      });
    }

    targetElement.addEventListener("wheel", handleMapWheelScroll, {
      passive: true,
    });

    requestAnimationFrame(() => {
      map.updateSize();
    });

    return () => {
      resizeObserver.disconnect();
      targetElement.removeEventListener("wheel", handleMapWheelScroll);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const view = mapInstanceRef.current.getView();
    view.setCenter(selectedCountry.center);
    view.setZoom(selectedCountry.zoom);
  }, [selectedCountry]);

  return (
    <main className="app-shell">
      {/* Sidebar: SEO optimized for "countries per flags" search queries */}
      <section className="country-panel" aria-label="Country flag selector">
        <header className="country-panel__header">
          <p className="country-panel__eyebrow">World Flags Explorer</p>
          <h1>Country Dex: Identify Countries by Their Flags</h1>
          <p className="country-panel__subtitle">
            Explore our <strong>global country flag database</strong> and select any nation to instantly center the interactive world map.
          </p>
        </header>

        <CountryList
          countries={countryCatalog}
          selectedCountryCode={selectedCountryCode}
          onSelectCountry={setSelectedCountryCode}
        />

        {isLoading ? <p className="country-panel__status">Updating country and flag data...</p> : null}
        {loadError ? <p className="country-panel__status is-error">{loadError}</p> : null}
      </section>

      {/* Map Section */}
      <section className="map-panel" aria-label="Interactive world map">
        <CountryMap country={selectedCountry}>
          <div className="country-map__target" ref={mapContainerRef} />
        </CountryMap>
      </section>

      {/* Footer: Keyword-rich content for search crawlers */}
      <footer className="app-footer">
        <div className="app-footer__content">
          <article className="app-footer__about">
            <h2>About Country Dex Flag Finder</h2>
            <p>
              Country Dex is an <strong>interactive world atlas</strong> created to help users
              identify countries by their flags. By combining a searchable list of
              national flags with live map positioning, it supports geography learning,
              exam preparation, and classroom activities for students and teachers.
            </p>

            <div className="app-footer__promo">
              <span>Try our trivia project:</span>
              <a href="https://pierre-gibault.github.io/Profdle/" target="_blank" rel="noopener noreferrer" className="promo-link">
                Profdle 🎓
              </a>
            </div>
          </article>

          <div className="app-footer__features">
            <h3>Key Geography Features</h3>
            <ul className="feature-grid">
              <li>Comprehensive countries and flags reference</li>
              <li>Interactive world map powered by OpenLayers</li>
              <li>Fast map focus for each selected country</li>
              <li>ISO-aligned country code identification</li>
            </ul>
          </div>

          <section className="app-footer__learning" aria-label="How to learn countries and flags">
            <h3>How to Learn Countries and Flags</h3>
            <ol className="learning-steps">
              <li>Pick one region and study 10 flags at a time.</li>
              <li>Select each country and match the flag with map location.</li>
              <li>Repeat the same set after 24 hours for better recall.</li>
              <li>Create mini quizzes mixing easy and difficult flags.</li>
            </ol>
          </section>

          <section className="app-footer__faq" aria-label="Frequently asked questions">
            <h3>FAQ</h3>
            <dl className="faq-list">
              <div>
                <dt>How can I identify countries by their flags faster?</dt>
                <dd>
                  Focus on unique symbols, stripe directions, and color order,
                  then confirm your guess using the map position.
                </dd>
              </div>
              <div>
                <dt>Is Country Dex useful for geography students?</dt>
                <dd>
                  Yes. It combines visual flag practice with real-world
                  geography, making exam preparation and class review easier.
                </dd>
              </div>
              <div>
                <dt>Can teachers use this in class?</dt>
                <dd>
                  Absolutely. Teachers can build short country-flag challenges
                  and use the map view for interactive group activities.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="app-footer__credits">
          <p>Developed by <strong>Inés Aamara</strong>, <strong>Clément Baratin</strong>, and <strong>Pierre Gibault</strong></p>
          <p className="footer-date">© 2026 Country Dex - Learn World Countries and Flags</p>
        </div>
      </footer>
    </main>
  );
}

export default App;