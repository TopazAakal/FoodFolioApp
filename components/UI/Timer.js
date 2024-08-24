import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Svg, Circle } from "react-native-svg";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Timer = ({ initialTime = 3661, onComplete }) => {
  const [time, setTime] = useState(initialTime);
  const radius = wp("15%"); // Radius of the circle
  const strokeWidth = wp("3.2%"); // Stroke width of the circle
  const svgSize = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 1) {
          clearInterval(intervalId);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: time,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [time]);

  const strokeDashoffset = animation.interpolate({
    inputRange: [0, initialTime],
    outputRange: [0, circumference],
  });

  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Svg width={svgSize} height={svgSize}>
        <Circle
          stroke="#ddd"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke="#4CAF50"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${radius + strokeWidth}, ${
            radius + strokeWidth
          })`}
        />
      </Svg>
      <Text style={styles.timerText}>{formatTime()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: wp("5%"),
  },
  timerText: {
    position: "absolute",
    fontSize: hp("3%"),
    fontWeight: "bold",
    color: "#333",
  },
});

export default Timer;
