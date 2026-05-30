import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRef, useState } from 'react';
import { buscarExerciciosPorNome } from '@/src/services/exercicioService';

type Props = {
  voltar: () => void;
  adicionar: (exercicio: any) => void;
};

export default function TelaBuscarExercicio({ voltar, adicionar }: Props) {
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const cacheRef = useRef<Record<string, any[]>>({});
  const timeoutRef = useRef<any>(null);

  async function buscar(nome: string) {
    setBusca(nome);

    const nomeLimpo = nome.trim().toLowerCase();

    if (nomeLimpo.length < 2) {
      setExercicios([]);
      return;
    }

    if (cacheRef.current[nomeLimpo]) {
      setExercicios(cacheRef.current[nomeLimpo]);
      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await buscarExerciciosPorNome(nomeLimpo);
        const lista = response.content || [];

        const filtrados = lista
          .filter((item: any) =>
            item.name.toLowerCase().includes(nomeLimpo)
          )
          .slice(0, 20);

        cacheRef.current[nomeLimpo] = filtrados;
        setExercicios(filtrados);

      } catch (err) {
        console.log('❌ ERRO BUSCA EXERCÍCIO:', err);
        setExercicios([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handlePress(item: any) {
    if (expandidoId === item.id) {
      adicionar(item);
    } else {
      setExpandidoId(item.id);
    }
  }

  const mostrarEmpty = busca.trim().length < 2 && !loading;

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
            fontSize: 26,
            fontWeight: 'bold',
            marginTop: 10,
            textAlign: 'center'
          }}>
            Buscar Exercícios
          </Text>
        </View>

        {/* 🔍 INPUT */}
        <TextInput
          value={busca}
          onChangeText={buscar}
          placeholder="Digite um exercício..."
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: '#1c1c1c',
            color: 'white',
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
            fontSize: 16
          }}
        />

        {loading && (
          <Text style={{ color: '#aaa', marginBottom: 10 }}>
            Buscando...
          </Text>
        )}

        {/* EMPTY */}
        {mostrarEmpty && (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
            marginTop: -40
          }}>
            <Image
              source={require('@/assets/images/nutri-treinando.png')}
              style={{ width: 190, height: 190, marginBottom: 20 }}
              resizeMode="contain"
            />

            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Adicione seus exercícios
            </Text>

            <Text style={{
              color: '#aaa',
              textAlign: 'center',
              fontSize: 14
            }}>
              Busque por nome para montar seu treino
            </Text>
          </View>
        )}

        {/* LISTA */}
        {!mostrarEmpty && (
          <FlatList
            data={exercicios}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}

            renderItem={({ item }) => {
              const expandido = expandidoId === item.id;

              const img1 = item.images?.[0];
              const img2 = item.images?.[1];

              return (
                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  style={{
                    backgroundColor: '#1c1c1c',
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 12,
                  }}
                >

                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    {item.name}
                  </Text>

                  {item.primaryMuscles?.length > 0 && (
                    <Text style={{
                      color: '#4CAF50',
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      {item.primaryMuscles.join(', ')}
                    </Text>
                  )}

                  {expandido && (
                    <View style={{ marginTop: 10 }}>

                      {/* 🖼 DUAS IMAGENS */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        gap: 10,
                        marginBottom: 12
                      }}>
                        {img1 && (
                          <Image
                            source={{ uri: img1 }}
                            style={{
                              width: 140,
                              height: 140,
                              borderRadius: 10
                            }}
                            resizeMode="cover"
                          />
                        )}

                        {img2 && (
                          <Image
                            source={{ uri: img2 }}
                            style={{
                              width: 140,
                              height: 140,
                              borderRadius: 10
                            }}
                            resizeMode="cover"
                          />
                        )}
                      </View>

                      {/* 🧠 DESCRIÇÃO DO EXERCÍCIO */}
                      {item.instructions && (
                        <Text style={{
                          color: 'white',
                          fontSize: 14,
                          fontWeight: '600',
                          marginBottom: 8,
                          lineHeight: 20
                        }}>
                          {item.instructions}
                        </Text>
                      )}

                      {/* 📊 INFORMAÇÕES */}
                      <View style={{ marginTop: 6 }}>

                        {item.level && (
                          <Text style={{ color: '#FFD54F', fontSize: 12, marginBottom: 2 }}>
                            Dificuldade: {item.level}
                          </Text>
                        )}

                        {item.equipment && (
                          <Text style={{ color: '#4FC3F7', fontSize: 12, marginBottom: 2 }}>
                            Equipamento: {item.equipment}
                          </Text>
                        )}

                        {item.category && (
                          <Text style={{ color: '#81C784', fontSize: 12 }}>
                            Categoria: {item.category}
                          </Text>
                        )}

                      </View>

                      <Text style={{
                        color: '#4CAF50',
                        fontSize: 12,
                        marginTop: 6
                      }}>
                        Toque novamente para adicionar
                      </Text>
                    </View>
                  )}

                  {!expandido && (
                    <Text style={{
                      color: '#aaa',
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      Toque para ver mais
                    </Text>
                  )}

                </TouchableOpacity>
              );
            }}
          />
        )}

      </View>
    </KeyboardAvoidingView>
  );
}