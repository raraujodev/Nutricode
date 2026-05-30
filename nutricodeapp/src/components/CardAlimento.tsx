// src/components/AlimentoCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Alimento } from "@/src/types/Alimento";

export function AlimentoCard({ alimento }: { alimento: Alimento }) {
  return (
    <View style={styles.card}>
      <Text style={styles.nome}>{alimento.name}</Text>
      <Text style={styles.info}>🔥 {alimento.kcal} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  nome: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    color: Colors.white,
  },
});