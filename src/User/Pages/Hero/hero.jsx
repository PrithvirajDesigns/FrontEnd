import React from "react";
import image from "./../../../../public/LovingDoodle.png";

const Hero = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}>
      <img
        src={image}
        alt="Loving Doodle"
        width="500"
        height="400"
      />
    </div>
  );
};

export default Hero;
