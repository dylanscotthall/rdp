"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";
import { api, type Location, type LocationMediaItem } from "@/app/lib/api";
import GlobeWireframe from "./components/GlobeWireFrame";
import styles from "./map.module.css";

const GLOBE_RADIUS = 2;
const CELESTIAL_RADIUS = 28;

// ── Coordinate conversion ──────────────────────────────────────────────────────

function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function vector3ToLatLng(vector: THREE.Vector3): { lat: number; lng: number } {
  const r = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  const lat = -((Math.acos(vector.y / r) * 180) / Math.PI - 90);

  let lng = -((Math.atan2(vector.z, vector.x) * 180) / Math.PI - 180);
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;

  return { lat, lng };
}

// ── Real-world-ish sun and moon positions ──────────────────────────────────────

function getSunPosition(date: Date): THREE.Vector3 {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = date.getTime();
  const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));

  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;

  const gamma =
    ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcMinutes / 60 - 12) / 24);

  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const subsolarLat = declination * deg;

  let subsolarLng = (720 - utcMinutes - equationOfTime) / 4;

  while (subsolarLng > 180) subsolarLng -= 360;
  while (subsolarLng < -180) subsolarLng += 360;

  return latLngToVector3(subsolarLat, subsolarLng, CELESTIAL_RADIUS);
}

function getMoonPosition(
  date: Date,
  sunPosition: THREE.Vector3,
): THREE.Vector3 {
  const lunarMonth = 29.530588853;
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();

  const daysSinceNewMoon =
    (date.getTime() - knownNewMoon) / (24 * 60 * 60 * 1000);

  const phaseAngle =
    ((daysSinceNewMoon % lunarMonth) / lunarMonth) * Math.PI * 2;

  return sunPosition
    .clone()
    .normalize()
    .multiplyScalar(-1)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), phaseAngle * 0.35)
    .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin(phaseAngle) * 0.25)
    .multiplyScalar(CELESTIAL_RADIUS * 0.85);
}

// ── Celestial visuals ──────────────────────────────────────────────────────────

function Sun({ position }: { position: THREE.Vector3 }) {
  const glowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);

    gradient.addColorStop(0, "rgba(255, 255, 230, 1)");
    gradient.addColorStop(0.2, "rgba(255, 225, 120, 0.9)");
    gradient.addColorStop(0.45, "rgba(255, 145, 50, 0.45)");
    gradient.addColorStop(1, "rgba(255, 120, 40, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group position={position}>
      {glowTexture && (
        <sprite scale={[5, 5, 1]}>
          <spriteMaterial
            map={glowTexture}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}

      <mesh>
        <sphereGeometry args={[0.38, 48, 48]} />
        <meshBasicMaterial color="#fff3ad" />
      </mesh>

      <pointLight intensity={35} distance={90} color="#fff1c2" />
    </group>
  );
}

function Moon({ position }: { position: THREE.Vector3 }) {
  const craters = [
    { lat: 18, lng: 20, size: 0.035 },
    { lat: -12, lng: 50, size: 0.026 },
    { lat: 35, lng: -40, size: 0.023 },
    { lat: -30, lng: -15, size: 0.031 },
    { lat: 5, lng: -70, size: 0.019 },
  ];

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.24, 48, 48]} />
        <meshStandardMaterial color="#cfcfcf" roughness={1} metalness={0} />
      </mesh>

      {craters.map((crater, index) => (
        <mesh
          key={index}
          position={latLngToVector3(crater.lat, crater.lng, 0.245)}
        >
          <sphereGeometry args={[crater.size, 16, 16]} />
          <meshStandardMaterial color="#8d8d8d" roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

// ── Location pins ───────────────────────────────────────────────────────────────

function LocationPins({
  locations,
  scale,
  onPinClick,
}: {
  locations: Location[];
  scale: number;
  onPinClick: (location: Location, event: MouseEvent) => void;
}) {
  return (
    <>
      {locations.map((location) => {
        const position = latLngToVector3(
          Number(location.latitude),
          Number(location.longitude),
          GLOBE_RADIUS + 0.05,
        );

        return (
          <mesh
            key={location.id}
            position={position.clone().multiplyScalar(scale)}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(location, e.nativeEvent);
            }}
          >
            <sphereGeometry args={[0.05 * scale, 16, 16]} />
            <meshBasicMaterial color="#f5c800" />
          </mesh>
        );
      })}
    </>
  );
}

function CameraTracker({
  targetPosition,
  onReachedTarget,
}: {
  targetPosition: THREE.Vector3 | null;
  onReachedTarget: () => void;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!targetPosition) return;

    const step = 2 * delta;
    camera.position.lerp(targetPosition, step);
    camera.lookAt(0, 0, 0);

    if (camera.position.distanceTo(targetPosition) < 0.01) {
      onReachedTarget();
    }
  });

  return null;
}

function CenterTracker({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  const { camera } = useThree();
  const last = useRef({ lat: 0, lng: 0 });

  useFrame(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const centerPoint = dir.clone().multiplyScalar(GLOBE_RADIUS);
    const { lat, lng } = vector3ToLatLng(centerPoint);

    if (
      Math.abs(lat - last.current.lat) > 0.01 ||
      Math.abs(lng - last.current.lng) > 0.01
    ) {
      last.current = { lat, lng };
      onChange(lat, lng);
    }
  });

  return null;
}

// ── Main scene ──────────────────────────────────────────────────────────────────

function GlobeScene() {
  const [scale, setScale] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [panelVisible, setPanelVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null,
  );
  const [centerCoords, setCenterCoords] = useState({ lat: 0, lng: 0 });
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationMedia, setLocationMedia] = useState<LocationMediaItem[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const sunPosition = useMemo(() => getSunPosition(currentDate), [currentDate]);
  const moonPosition = useMemo(
    () => getMoonPosition(currentDate, sunPosition),
    [currentDate, sunPosition],
  );

  const controlsRef = useRef<any>(null);

  useEffect(() => {
    api
      .fetchLocations()
      .then(setLocations)
      .catch((err) => {
        console.error("Failed to load locations:", err);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setSelectedLocation(null);
      setPanelVisible(false);
      setActiveMediaIndex(null);
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handlePinClick = async (location: Location, event: MouseEvent) => {
    event.stopPropagation();

    if (selectedLocation?.id === location.id && panelVisible) {
      setSelectedLocation(null);
      setPanelVisible(false);
      setLocationMedia([]);
      setActiveMediaIndex(null);
      return;
    }

    const newPos = latLngToVector3(
      Number(location.latitude),
      Number(location.longitude),
      5,
    );

    setSelectedLocation(location);
    setTargetPosition(newPos);
    setPanelVisible(false);
    setActiveMediaIndex(null);

    if (controlsRef.current) controlsRef.current.enabled = false;

    try {
      const media = await api.fetchLocationMedia(location.id);
      setLocationMedia(media ?? []);
    } catch (err) {
      console.error("Failed to fetch location media:", err);
      setLocationMedia([]);
    }
  };

  const handleTargetReached = () => {
    setTargetPosition(null);
    setPanelVisible(true);

    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setScale((prev) => Math.min(Math.max(prev - e.deltaY * 0.001, 0.5), 2));
  };

  const closePanel = () => {
    setPanelVisible(false);
    setSelectedLocation(null);
    setActiveMediaIndex(null);
  };

  const activeMedia =
    activeMediaIndex !== null ? locationMedia[activeMediaIndex] : null;

  return (
    <div className={styles.container} onWheel={handleWheel}>
      <Canvas camera={{ position: [0, 0, 5], fov: 70 }}>
        {/*<color attach="background" args={["#02040a"]} />*/}

        <ambientLight intensity={0.02} />

        <directionalLight
          position={sunPosition}
          intensity={10}
          color="#ffffff"
        />

        <directionalLight
          position={sunPosition.clone().multiplyScalar(-1)}
          intensity={0.02}
          color="#102850"
        />

        <Sun position={sunPosition} />
        <Moon position={moonPosition} />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          fade
          speed={0.4}
        />

        <Suspense fallback={null}>
          <group scale={[scale, scale, scale]}>
            <GlobeWireframe />
          </group>

          <LocationPins
            locations={locations}
            scale={scale}
            onPinClick={handlePinClick}
          />
        </Suspense>

        <OrbitControls ref={controlsRef} enableZoom={false} />

        <CameraTracker
          targetPosition={targetPosition}
          onReachedTarget={handleTargetReached}
        />

        <CenterTracker onChange={(lat, lng) => setCenterCoords({ lat, lng })} />
      </Canvas>

      {panelVisible && selectedLocation && (
        <div
          className={`${styles.sidePanel} ${panelVisible ? styles.show : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>{selectedLocation.name}</h2>

              {selectedLocation.country && (
                <span className={styles.panelSubtitle}>
                  {selectedLocation.country}
                </span>
              )}
            </div>

            <button
              className={styles.closeBtn}
              onClick={closePanel}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {locationMedia.length > 0 ? (
            <div className={styles.imageGrid}>
              {locationMedia.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  className={styles.imageThumb}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex(index);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.fileUrl}
                      alt={item.caption ?? selectedLocation.name}
                      fill
                      sizes="140px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <video
                        src={item.fileUrl}
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <div className={styles.thumbPlayIcon}>▶</div>
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.noImages}>No media for this location yet.</p>
          )}
        </div>
      )}

      {activeMedia && (
        <div
          className={styles.lightbox}
          onClick={() => setActiveMediaIndex(null)}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setActiveMediaIndex(null)}
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className={styles.lightboxImageWrap}
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.type === "image" ? (
              <Image
                src={activeMedia.fileUrl}
                alt={activeMedia.caption ?? ""}
                fill
                sizes="100vw"
                style={{ objectFit: "contain" }}
                priority
              />
            ) : (
              <video
                src={activeMedia.fileUrl}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}
          </div>

          {activeMedia.caption && (
            <div className={styles.lightboxCaption}>{activeMedia.caption}</div>
          )}
        </div>
      )}

      <div className={styles.coordDisplay}>
        <span>LAT {centerCoords.lat.toFixed(2)}</span>
        <span>LNG {centerCoords.lng.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(GlobeScene), { ssr: false });
