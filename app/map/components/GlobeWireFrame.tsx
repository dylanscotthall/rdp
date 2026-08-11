"use client";

import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";

const GLOBE_RADIUS = 2;

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

export default function GlobeWireframe({
  radius = GLOBE_RADIUS,
}: {
  radius?: number;
}) {
  const [countryLines, setCountryLines] = useState<THREE.Vector3[][]>([]);

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

        setCountryLines(lines);
      })
      .catch((err) => console.error("Failed to load world topology:", err));

    return () => {
      cancelled = true;
    };
  }, [radius]);

  // Build Three.js Line objects inside useMemo so they are only
  // recreated when the underlying data changes, not on every render.
  const countryLineObjects = useMemo(
    () =>
      countryLines.map(
        (points) =>
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: "#f5c800",
              transparent: true,
              opacity: 0.8,
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
      {/* Base sphere */}
      <mesh>
        <sphereGeometry args={[radius - 0.005, 64, 64]} />
        <meshPhongMaterial
          color="#11203f"
          emissive="#050b18"
          emissiveIntensity={0.6}
          specular="#3a4a6b"
          shininess={12}
        />
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

      {/* Country border lines */}
      {countryLineObjects.map((lineObj, i) => (
        <primitive key={`country-${i}`} object={lineObj} />
      ))}
    </group>
  );
}
