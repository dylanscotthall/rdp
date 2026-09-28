"use client";

import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, Position } from "geojson";

const GLOBE_RADIUS = 2;

const TEXTURE_WIDTH = 4096;
const TEXTURE_HEIGHT = 2048;
const OCEAN_COLOR = "#11203f";
const LAND_COLOR = "#3f8a4b";

function geoToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function extractRings(geometry: Geometry): [number, number][][] {
  if (geometry.type === "Polygon") {
    return geometry.coordinates as [number, number][][];
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as [number, number][][][]).flat();
  }
  return [];
}

function buildGraticule(radius: number, step = 15): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = [];

  for (let lat = -75; lat <= 75; lat += step) {
    const ring: THREE.Vector3[] = [];
    for (let lng = -180; lng <= 180; lng += 4) {
      ring.push(geoToVector3(lat, lng, radius));
    }
    lines.push(ring);
  }

  for (let lng = -180; lng < 180; lng += step) {
    const ring: THREE.Vector3[] = [];
    for (let lat = -90; lat <= 90; lat += 4) {
      ring.push(geoToVector3(lat, lng, radius));
    }
    lines.push(ring);
  }

  return lines;
}

function extractPolygons(geometry: Geometry | null): Position[][][] {
  if (geometry?.type === "Polygon") return [geometry.coordinates];
  if (geometry?.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

// Makes a ring's longitudes continuous across the antimeridian, so a ring
// that crosses ±180° doesn't draw a stripe across the whole map. Rings that
// wrap all the way around the globe (Antarctica) are closed via the pole.
function unwrapRing(ring: Position[]): [number, number][] {
  const points: [number, number][] = [];
  let offset = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    if (i > 0) {
      const delta = lng - ring[i - 1][0];
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    points.push([lng + offset, lat]);
  }

  const first = points[0];
  const last = points[points.length - 1];
  if (Math.abs(last[0] - first[0]) > 180) {
    const meanLat = points.reduce((sum, [, lat]) => sum + lat, 0) / points.length;
    const poleLat = meanLat < 0 ? -90 : 90;
    points.push([last[0], poleLat], [first[0], poleLat]);
  }
  return points;
}

// Paints land onto an equirectangular canvas that wraps onto the sphere:
// x = (lng + 180) / 360, y = (90 - lat) / 180 matches SphereGeometry's UVs
// and geoToVector3's orientation.
function buildLandTexture(land: FeatureCollection): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = OCEAN_COLOR;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  ctx.fillStyle = LAND_COLOR;

  for (const feature of land.features) {
    for (const polygon of extractPolygons(feature.geometry)) {
      const rings = polygon.map(unwrapRing);
      // Draw shifted copies so land that spills past ±180° appears on the other edge
      for (const shift of [-360, 0, 360]) {
        ctx.beginPath();
        for (const ring of rings) {
          ring.forEach(([lng, lat], i) => {
            const x = ((lng + shift + 180) / 360) * TEXTURE_WIDTH;
            const y = ((90 - lat) / 180) * TEXTURE_HEIGHT;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
        // evenodd keeps inner rings (e.g. the Caspian Sea) as water
        ctx.fill("evenodd");
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export default function GlobeWireframe({
  radius = GLOBE_RADIUS,
}: {
  radius?: number;
}) {
  const [countryLines, setCountryLines] = useState<THREE.Vector3[][]>([]);
  const [landTexture, setLandTexture] = useState<THREE.CanvasTexture | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((topology: Topology) => {
        if (cancelled) return;

        const countries = topojson.feature(
          topology,
          topology.objects.countries as GeometryCollection,
        ) as unknown as FeatureCollection;

        const lines: THREE.Vector3[][] = [];

        for (const feature of countries.features) {
          const rings = extractRings(feature.geometry);
          for (const ring of rings) {
            const points = ring.map(([lng, lat]) =>
              geoToVector3(lat, lng, radius + 0.004),
            );
            lines.push(points);
          }
        }

        const land = topojson.feature(
          topology,
          topology.objects.land as GeometryCollection,
        ) as unknown as FeatureCollection;

        setCountryLines(lines);
        setLandTexture(buildLandTexture(land));
      })
      .catch((err) => console.error("Failed to load world topology:", err));

    return () => {
      cancelled = true;
    };
  }, [radius]);

  useEffect(() => () => landTexture?.dispose(), [landTexture]);

  // Build Three.js Line objects inside useMemo so they are only
  // recreated when the underlying data changes, not on every render.
  const countryLineObjects = useMemo(
    () =>
      countryLines.map(
        (points) =>
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: "#d9f2cf",
              transparent: true,
              opacity: 0.35,
            }),
          ),
      ),
    [countryLines],
  );

  const graticuleLineObjects = useMemo(() => {
    const lines = buildGraticule(radius + 0.002);
    return lines.map(
      (points) =>
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color: "#6b7a99",
            transparent: true,
            opacity: 0.25,
          }),
        ),
    );
  }, [radius]);

  return (
    <group>
      {/* Base sphere — ocean plus painted land. It also swallows pointer
          events so pins on the far side can't be hovered or clicked through it. */}
      <mesh
        onClick={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <sphereGeometry args={[radius - 0.005, 64, 64]} />
        {landTexture ? (
          // Faint emissive copy of the map keeps continents visible on the night side
          <meshPhongMaterial
            key="land"
            map={landTexture}
            emissive="#ffffff"
            emissiveMap={landTexture}
            emissiveIntensity={0.12}
            specular="#3a4a6b"
            shininess={12}
          />
        ) : (
          <meshPhongMaterial
            key="plain"
            color={OCEAN_COLOR}
            emissive="#050b18"
            emissiveIntensity={0.6}
            specular="#3a4a6b"
            shininess={12}
          />
        )}
      </mesh>

      {/* Atmosphere rim glow */}
      <mesh>
        <sphereGeometry args={[radius + 0.025, 48, 48]} />
        <meshBasicMaterial
          color="#f5c800"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Graticule grid — primitive avoids the SVG <line> type conflict */}
      {graticuleLineObjects.map((lineObj, i) => (
        <primitive key={`grat-${i}`} object={lineObj} />
      ))}

      {/* Country borders — faint, so the green fill does the work */}
      {countryLineObjects.map((lineObj, i) => (
        <primitive key={`country-${i}`} object={lineObj} />
      ))}
    </group>
  );
}
