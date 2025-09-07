import React, { useState, useEffect } from "react";

const StorageCircle = ({ remaining, total = 2 }) => {
  const [radius, setRadius] = useState(90); // default radius
  const [textSize, setTextSize] = useState({ percent: 25, label: 15 }); // default font sizes

  // Change radius and text size on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRadius(70); // smaller radius
        setTextSize({ percent: 18, label: 12 }); // smaller text
      } else {
        setRadius(90); // default radius
        setTextSize({ percent: 25, label: 15 }); // default text
      }
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stroke = 20;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const used = total - remaining;
  const percentUsed = (used / total) * 100;

  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - percentUsed / 100);

  return (
    <svg height={radius * 2} width={radius * 2}>
      {/* Background circle */}
      <circle
        stroke="#fb8e91"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />

      {/* Foreground circle */}
      <circle
        stroke="#ffff"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />

      {/* Used storage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="white"
      >
        <tspan
          x="50%"
          dy="-0.3em"
          fill="white"
          fontSize={textSize.percent} // responsive percent size
        >
          {percentUsed.toFixed(2)}%
        </tspan>
        <tspan
          x="50%"
          dy="2em"
          fontSize={textSize.label} // responsive label size
          fill="white"
          fontWeight="normal"
        >
          space used
        </tspan>
      </text>
    </svg>
  );
};

export default StorageCircle;
