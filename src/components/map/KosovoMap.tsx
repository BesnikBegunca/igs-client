import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";


import "leaflet/dist/leaflet.css";


import L from "leaflet";



// custom marker

const markerIcon = new L.Icon({

    iconUrl:
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",

    iconSize: [
        35,
        35
    ],

    iconAnchor: [
        17,
        35
    ]

});





export default function KosovoMap() {



    const kosovoCenter: [number, number] = [

        42.6026,

        20.9030

    ];





    return (


        <div className="kosovo-map">



            <MapContainer


                center={kosovoCenter}


                zoom={9}


                scrollWheelZoom={true}


                style={{

                    width: "100%",

                    height: "100%"

                }}


            >



                <TileLayer


                    attribution="© OpenStreetMap"


                    url="
                    https://tile.openstreetmap.org/{z}/{x}/{y}.png
                    "


                />





                <Marker


                    position={kosovoCenter}


                    icon={markerIcon}


                >


                    <Popup>


                        🇽🇰 IGS Intelligence Center


                    </Popup>



                </Marker>




            </MapContainer>



        </div>


    );


}