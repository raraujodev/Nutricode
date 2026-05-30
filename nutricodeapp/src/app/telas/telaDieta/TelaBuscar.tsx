import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';

import { useRef, useState } from 'react';

import { buscarAlimentosPorNome } from '@/src/services/alimentoService';

type Props = {
  voltar: () => void;
  adicionar: (alimento: any) => void;
};

export default function TelaBuscar({
  voltar,
  adicionar,
}: Props) {

  const [alimentos, setAlimentos] =
    useState<any[]>([]);

  const [busca, setBusca] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const cacheRef =
    useRef<Record<string, any[]>>({});

  const timeoutRef =
    useRef<any>(null);

  async function buscar(nome: string) {

    setBusca(nome);

    const nomeLimpo =
      nome.trim().toLowerCase();

    if (nomeLimpo.length < 2) {

      setAlimentos([]);

      return;
    }

    if (cacheRef.current[nomeLimpo]) {

      setAlimentos(
        cacheRef.current[nomeLimpo]
      );

      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current =
      setTimeout(async () => {

        setLoading(true);

        try {

          const resultado =
            await buscarAlimentosPorNome(
              nomeLimpo
            );

          const filtrados =
            resultado
              .filter((item: any) => {

                const palavras =
                  item.name
                    .toLowerCase()
                    .split(' ');

                return palavras.some(
                  (p: string) =>
                    p.startsWith(nomeLimpo)
                );
              })
              .slice(0, 20);

          cacheRef.current[nomeLimpo] =
            filtrados;

          setAlimentos(filtrados);

        } catch (err) {

          console.log(
            '❌ ERRO BUSCA:',
            err
          );

          setAlimentos([]);

        } finally {

          setLoading(false);
        }
      }, 300);
  }

  const estaVazio =
    busca.trim().length < 2;

  return (

    <View
      style={{
        flex: 1,
        backgroundColor: '#0f0f0f',
        padding: 20,
      }}
    >

      {/* TOPO */}

      <View
        style={{
          marginBottom: 20,
        }}
      >

        <TouchableOpacity
          onPress={voltar}
        >

          <Text
            style={{
              color: '#4CAF50',
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            ← Voltar
          </Text>

        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 'bold',
            marginTop: 10,
            textAlign: 'center',
          }}
        >
          Buscar Alimentos
        </Text>

      </View>

      {/* INPUT */}

      <TextInput
        value={busca}

        onChangeText={buscar}

        placeholder="Digite arroz, frango, banana..."

        placeholderTextColor="#888"

        style={{
          backgroundColor: '#1c1c1c',
          color: 'white',
          padding: 16,
          borderRadius: 14,
          marginBottom: 15,
          fontSize: 16,
        }}
      />

      {/* LOADING */}

      {loading && (

        <Text
          style={{
            color: '#aaa',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Buscando alimentos...
        </Text>
      )}

      {/* ESTADO INICIAL */}

      {estaVazio ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',

            top: 140,
            left: 0,
            right: 0,
            bottom: 0,

            justifyContent: 'center',
            alignItems: 'center',

            paddingHorizontal: 30,
          }}
        >

          <Image
            source={require('@/assets/images/nutri-cozinheiro.png')}

            style={{
              width: 180,
              height: 180,
              marginBottom: 20,
            }}

            resizeMode="contain"
          />

          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Adicione seus alimentos
          </Text>

          <Text
            style={{
              color: '#aaa',
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Busque por alimentos para montar sua refeição
          </Text>

        </View>

      ) : (

        <FlatList
          data={alimentos}

          keyExtractor={(item) =>
            item.id.toString()
          }

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={{
            paddingBottom: 40,
          }}

          renderItem={({ item }) => (

            <TouchableOpacity
              onPress={() =>
                adicionar(item)
              }

              style={{
                backgroundColor: '#1c1c1c',
                padding: 16,
                borderRadius: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#2a2a2a',
              }}
            >

              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  color: '#4CAF50',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Toque para adicionar
              </Text>

            </TouchableOpacity>
          )}

          ListEmptyComponent={() =>

            !loading && (

              <View
                style={{
                  marginTop: 40,
                  alignItems: 'center',
                }}
              >

                <Text
                  style={{
                    color: '#888',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                >
                  Nenhum alimento encontrado
                </Text>

              </View>
            )
          }
        />
      )}

    </View>
  );
}