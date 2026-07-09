import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  Easing,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
const logoSource = require('../assets/logo.png');
interface Props {
  onFinish?: () => void;
  immersive?: boolean;
  onAnimationComplete?: () => void;
}
const SplashScreen: React.FC<Props> = ({
  immersive = false,
  onAnimationComplete,
  onFinish,
}) => {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(
    width * (immersive ? 0.38 : 0.34),
    immersive ? 160 : 140,
  );
  const logoHeight = logoWidth;
  const bgOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(immersive ? 0.78 : 0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(18)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(
    new Animated.Value(immersive ? 0.9 : 0.96),
  ).current;
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
    onFinishRef.current = onFinish;
  }, [onAnimationComplete, onFinish]);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: immersive ? 1.08 : 1.04,
        duration: immersive ? 920 : 800,
        easing: Easing.out(Easing.back(immersive ? 0.9 : 1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: immersive ? 1.02 : 1.0,
        duration: immersive ? 960 : 850,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(280),
        Animated.parallel([
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 520,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(contentScale, {
          toValue: immersive ? 1.07 : 1.03,
          duration: immersive ? 980 : 900,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: immersive ? 1.12 : 1.07,
          duration: immersive ? 980 : 900,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(bgOpacity, {
            toValue: 0,
            duration: 480,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
            useNativeDriver: true,
          }),
          Animated.timing(contentScale, {
            toValue: immersive ? 1.2 : 1.12,
            duration: immersive ? 560 : 480,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onAnimationCompleteRef.current) {
            onAnimationCompleteRef.current();
          }
          if (onFinishRef.current) {
            onFinishRef.current();
          }
        });
      });
    });
  }, [
    bgOpacity,
    contentScale,
    immersive,
    logoOpacity,
    logoScale,
    textOpacity,
    textTranslateY,
  ]);
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: bgOpacity,
        },
      ]}
      renderToHardwareTextureAndroid={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.View
        style={[
          styles.logoStage,
          {
            transform: [
              {
                scale: contentScale,
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              width: logoWidth,
              height: logoHeight,
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
          renderToHardwareTextureAndroid={true}
        >
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [
                {
                  translateY: textTranslateY,
                },
              ],
            },
          ]}
        >
          <Text style={styles.appName}>Rivo</Text>
          <Text style={styles.communityName}>Agent works offline</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 99999,
    zIndex: 99999,
  },
  logoStage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 80,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'SF-Pro-Rounded-Bold',
    letterSpacing: 1.5,
  },
  communityName: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    letterSpacing: 1.0,
    marginTop: 8,
  },
});
export default SplashScreen;
