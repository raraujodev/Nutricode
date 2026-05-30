import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useState } from 'react';
import { DiaTreino } from '@/src/types/Treino';

type Props = {
  dia: DiaTreino;
  voltar: () => void;
  irBuscar: () => void;
  removerExercicio: (id: string) => void;
  atualizarExercicio: (id: string, series: number, reps: number) => void;
};

export default function TelaTreino({
  dia,
  voltar,
  irBuscar,
  removerExercicio,
  atualizarExercicio,
}: Props) {

  const [inputs, setInputs] = useState<Record<string, { s: string; r: string }>>({});

  const vazio = dia.exercicios.length === 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f0f0f' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <View style={{ flex: 1, padding: 20 }}>

        {/* 🔙 TOPO */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity onPress={voltar}>
            <Text style={{ color: '#4CAF50', fontSize: 18, fontWeight: '600' }}>
              ← Voltar
            </Text>
          </TouchableOpacity>

          <Text style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 10
          }}>
            {dia.nome}
          </Text>
        </View>

        {vazio ? (

          /* 🔥 AGORA IGUAL AO DA REFEIÇÃO */
          <FlatList
            data={[]}
            renderItem={null}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 30
            }}
            ListEmptyComponent={() => (
              <>
                <Image
                  source={require('@/assets/images/treino-vazio.png')}
                  style={{
                    width: 250,
                    height: 250,
                    marginBottom: 10,
                    opacity: 0.9,
                  }}
                  resizeMode="stretch"
                />

                <Text style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  Nenhum exercício ainda
                </Text>

                <Text style={{
                  color: '#aaa',
                  textAlign: 'center',
                  marginBottom: 20
                }}>
                  Adicione exercícios para montar seu treino
                </Text>

                <TouchableOpacity
                  onPress={irBuscar}
                  style={{
                    backgroundColor: '#4CAF50',
                    paddingVertical: 16,
                    paddingHorizontal: 30,
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Adicionar Exercício
                  </Text>
                </TouchableOpacity>
              </>
            )}
          />

        ) : (

          <FlatList
            data={dia.exercicios}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 140 }}
            keyboardShouldPersistTaps="handled"

            renderItem={({ item }) => {

              const input = inputs[item.id] || {
                s: String(item.series),
                r: String(item.repeticoes)
              };

              return (
                <View style={{
                  backgroundColor: '#1c1c1c',
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 12,
                }}>

                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    {item.exercicio.name}
                  </Text>

                  <Text style={{
                    color: '#4CAF50',
                    fontSize: 12,
                    marginTop: 4
                  }}>
                    {item.exercicio.primaryMuscles?.join(', ')}
                  </Text>

                  <View style={{
                    flexDirection: 'row',
                    gap: 10,
                    marginTop: 10
                  }}>

                    <TextInput
                      value={input.s}
                      keyboardType="numeric"
                      placeholder="Séries"
                      placeholderTextColor="#777"
                      onChangeText={(text) => {
                        setInputs(prev => ({
                          ...prev,
                          [item.id]: { ...input, s: text }
                        }));
                      }}
                      onBlur={() => {
                        atualizarExercicio(
                          item.id,
                          parseInt(input.s) || 0,
                          parseInt(input.r) || 0
                        );
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#333',
                        color: 'white',
                        padding: 10,
                        borderRadius: 10,
                      }}
                    />

                    <TextInput
                      value={input.r}
                      keyboardType="numeric"
                      placeholder="Reps"
                      placeholderTextColor="#777"
                      onChangeText={(text) => {
                        setInputs(prev => ({
                          ...prev,
                          [item.id]: { ...input, r: text }
                        }));
                      }}
                      onBlur={() => {
                        atualizarExercicio(
                          item.id,
                          parseInt(input.s) || 0,
                          parseInt(input.r) || 0
                        );
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#333',
                        color: 'white',
                        padding: 10,
                        borderRadius: 10,
                      }}
                    />

                  </View>

                  <TouchableOpacity
                    onPress={() => removerExercicio(item.id)}
                    style={{
                      backgroundColor: '#FF5555',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignSelf: 'flex-end',
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      Remover
                    </Text>
                  </TouchableOpacity>

                </View>
              );
            }}

            ListFooterComponent={() => (
              <TouchableOpacity
                onPress={irBuscar}
                style={{
                  marginTop: 10,
                  backgroundColor: '#1f3f1f',
                  borderRadius: 14,
                  padding: 18,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#4CAF50',
                }}
              >
                <Text style={{
                  color: '#4CAF50',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}>
                  + Adicionar Exercício
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

      </View>
    </KeyboardAvoidingView>
  );
}