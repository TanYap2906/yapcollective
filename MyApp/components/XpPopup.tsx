import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type XpPopupProps = {
  amount: number;
  message: string;
  onClose: () => void;
  visible: boolean;
};

export function XpPopup({ amount, message, onClose, visible }: XpPopupProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 180,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          friction: 7,
          tension: 90,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 150,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        duration: 150,
        toValue: 0.94,
        useNativeDriver: true,
      }),
    ]).start(() => setShouldRender(false));
  }, [opacity, scale, visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        duration: 150,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        duration: 150,
        toValue: 0.94,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="box-none">
      <TouchableOpacity activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.popupShadow, { transform: [{ scale }] }]}>
          <Animated.View style={styles.popupCard}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.earned}>You earned:</Text>
          <View style={styles.amountBox}>
            <Text style={styles.amountText}>{amount} xp</Text>
          </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  popupShadow: {
    backgroundColor: '#eab8b9',
    borderRadius: 18,
    paddingBottom: 10,
    paddingRight: 10,
    shadowColor: '#3a2b3e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  popupCard: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 15,
    minWidth: 256,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  message: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 23,
    lineHeight: 31,
    marginBottom: 12,
    textAlign: 'center',
  },
  earned: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  amountBox: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    minWidth: 220,
    paddingVertical: 10,
  },
  amountText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 22,
  },
});
