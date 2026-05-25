import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { FAB } from 'react-native-paper';

export default function AnimatedFAB({ style, ...props }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(rotateAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(rotateAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { rotate: rotation }],
  };

  const { color = 'white', style: fabStyle, ...restProps } = props;

  return (
    <Animated.View style={[style, animatedStyle]}>
      <FAB 
        {...restProps}
        style={fabStyle}
        color={color}
        backgroundColor="#4CAF50"
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut} 
      />
    </Animated.View>
  );
}
