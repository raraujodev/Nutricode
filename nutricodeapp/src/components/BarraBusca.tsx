// src/components/BarraBusca.tsx

import { TextInput, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export function BarraBusca({ valor, aoMudar }: any) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Buscar alimento..."
      placeholderTextColor="#aaa"
      value={valor}
      onChangeText={aoMudar}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: '#ffffff10',
    padding: 12,
    borderRadius: 10,
    color: Colors.white,
    marginBottom: 15,
  },
});