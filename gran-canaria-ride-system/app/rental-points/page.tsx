"use client"

import "./rental-points.scss";
import { MapContainer, TileLayer, Marker, useMap  } from "react-leaflet"
import L from "leaflet";
import { useEffect, useState } from "react";

L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

function FixMapSize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);


  }, [map]);

  return null;
}

export default function RentalPoints() {

  const [ rentalPoints, setRentalPoints  ] = useState([]);

  const getRentalPoint = async () => {
    const response = await fetch(`/api/rental-point`);
    if (response.ok) {
      response.json().then(responseBody => {
        setRentalPoints(responseBody.data);
      });
    }
  }

  const markerClick = (rentalPoint: any) => {
    console.log(rentalPoint);
  }

  useEffect(() => {
    getRentalPoint().then();
  }, []);

  return (
    <div className="rental-points-container">
      <div className="rental-points-container-text">
        <h2>MAP OF AVAILABLE BIKES</h2>
        <p>Here, you can see our renting points and the bicycles available there:</p>
      </div>

      <MapContainer
        center={[28.112021, -15.433341]}
        zoom={13}
        style={{ flex: "1 1 auto", minHeight: "0", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {
          rentalPoints.map((value: any) => (
            <Marker
              key={value.id} position={[value.latitude, value.longitude]}
              eventHandlers={{
                click: () => { markerClick(value) }
              }}
            />
          ))
        }

        <FixMapSize />
      </MapContainer>
    </div>
  )
}