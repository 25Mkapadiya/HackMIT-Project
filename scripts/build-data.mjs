// Offline preprocessing: converts committed Census-derived TopoJSON (us-atlas,
// itself sourced from Census TIGER/Line cartographic boundary files) into
// flat GeoJSON the frontend fetches statically. Run once with `npm run
// prep-data`; the app never hits a live geography API at demo time.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as topojson from "topojson-client";
import * as turf from "@turf/turf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const statesTopo = JSON.parse(readFileSync(join(root, "data/raw/states-10m.json"), "utf8"));
const countiesTopo = JSON.parse(readFileSync(join(root, "data/raw/counties-10m.json"), "utf8"));
const statesMeta = JSON.parse(readFileSync(join(root, "src/data/states-meta.json"), "utf8"));

const statesGeo = topojson.feature(statesTopo, statesTopo.objects.states);
const countiesGeo = topojson.feature(countiesTopo, countiesTopo.objects.counties);

statesGeo.features.forEach((f) => {
  const meta = statesMeta[f.id];
  f.properties = {
    fips: f.id,
    name: meta ? meta.name : f.properties.name,
    postal: meta ? meta.postal : null,
  };
});

countiesGeo.features.forEach((f) => {
  const stateFips = String(f.id).padStart(5, "0").slice(0, 2);
  const meta = statesMeta[stateFips];
  const areaKm2 = turf.area(f) / 1_000_000;
  const centroid = turf.centroid(f).geometry.coordinates;
  f.properties = {
    fips: String(f.id).padStart(5, "0"),
    stateFips,
    statePostal: meta ? meta.postal : null,
    name: f.properties.name,
    areaKm2: Math.round(areaKm2 * 10) / 10,
    centroid,
  };
});

writeFileSync(join(root, "public/data/us-states.json"), JSON.stringify(statesGeo));
writeFileSync(join(root, "public/data/us-counties.json"), JSON.stringify(countiesGeo));

console.log(`states: ${statesGeo.features.length}, counties: ${countiesGeo.features.length}`);
