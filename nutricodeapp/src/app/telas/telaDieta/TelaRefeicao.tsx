import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import { useState, useEffect } from 'react';

export default function TelaRefeicao({
  refeicao,
  voltar,
  irBuscar,
  removerAlimento,
  atualizarQuantidade,
}: any) {

  const [inputs, setInputs] =
    useState<{ [key: string]: string }>({});

  const [keyboardAberto, setKeyboardAberto] =
    useState(false);

  useEffect(() => {

    const showListener =
      Keyboard.addListener(
        'keyboardDidShow',
        () => setKeyboardAberto(true)
      );

    const hideListener =
      Keyboard.addListener(
        'keyboardDidHide',
        () => setKeyboardAberto(false)
      );

    return () => {
      showListener.remove();
      hideListener.remove();
    };

  }, []);

  const totais = refeicao.alimentos.reduce(
    (acc: any, item: any) => {

      const fator = item.quantidade / 100;

      acc.kcal += item.alimento.kcal * fator;
      acc.prot += item.alimento.protein * fator;
      acc.carb += item.alimento.carbohydrates * fator;
      acc.gord += item.alimento.lipids * fator;
      acc.fibra += item.alimento.dietaryFiber * fator;

      return acc;
    },
    {
      kcal: 0,
      prot: 0,
      carb: 0,
      gord: 0,
      fibra: 0,
    }
  );

  return (

    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: '#0f0f0f',
      }}

      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }

      keyboardVerticalOffset={
        Platform.OS === 'ios'
          ? 90
          : 20
      }
    >

      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >

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
            {refeicao.nome}
          </Text>

        </View>

        <FlatList
          data={refeicao.alimentos}

          keyExtractor={(item) =>
            item.id
          }

          keyboardShouldPersistTaps="handled"

          keyboardDismissMode="interactive"

          showsVerticalScrollIndicator={false}

          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom:
              keyboardAberto ? 40 : 220,

            justifyContent:
              refeicao.alimentos.length === 0
                ? 'center'
                : 'flex-start',
          }}

          renderItem={({ item }) => {

            const fator =
              item.quantidade / 100;

            const kcal =
              (
                item.alimento.kcal * fator
              ).toFixed(1);

            const prot =
              (
                item.alimento.protein * fator
              ).toFixed(1);

            const carb =
              (
                item.alimento.carbohydrates * fator
              ).toFixed(1);

            const gord =
              (
                item.alimento.lipids * fator
              ).toFixed(1);

            const fibra =
              (
                item.alimento.dietaryFiber * fator
              ).toFixed(1);

            const valorInput =
              inputs[item.id] !== undefined
                ? inputs[item.id]
                : String(item.quantidade);

            return (

              <View
                style={{
                  backgroundColor: '#1c1c1c',
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              >

                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {item.alimento.name}
                </Text>

                <Text
                  style={{
                    color: '#aaa',
                    marginTop: 6,
                  }}
                >
                  Quantidade (g)
                </Text>

                <TextInput
                  value={valorInput}

                  keyboardType="numeric"

                  returnKeyType="done"

                  blurOnSubmit

                  placeholder="Ex: 100"

                  placeholderTextColor="#777"

                  onFocus={() => {
                    setKeyboardAberto(true);
                  }}

                  onChangeText={(text) => {

                    const somenteNumeros =
                      text.replace(
                        /[^0-9]/g,
                        ''
                      );

                    setInputs(prev => ({
                      ...prev,
                      [item.id]:
                        somenteNumeros,
                    }));
                  }}

                  onBlur={() => {

                    const valor =
                      parseInt(
                        inputs[item.id] || '0'
                      );

                    if (
                      !valor ||
                      valor <= 0
                    ) {

                      setKeyboardAberto(false);
                      return;
                    }

                    atualizarQuantidade(
                      item.id,
                      valor
                    );

                    setInputs(prev => {

                      const novo = {
                        ...prev,
                      };

                      delete novo[item.id];

                      return novo;
                    });

                    setKeyboardAberto(false);
                  }}

                  style={{
                    backgroundColor: '#333',
                    color: 'white',
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 5,
                    marginBottom: 10,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                  }}
                >

                  <Text
                    style={{
                      color: 'white',
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    {kcal} kcal
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >

                    <Text
                      style={{
                        color: '#FF6B6B',
                        fontSize: 12,
                      }}
                    >
                      Prot: {prot}g
                    </Text>

                    <Text
                      style={{
                        color: '#4FC3F7',
                        fontSize: 12,
                      }}
                    >
                      Carb: {carb}g
                    </Text>

                    <Text
                      style={{
                        color: '#FFD54F',
                        fontSize: 12,
                      }}
                    >
                      Gord: {gord}g
                    </Text>

                    <Text
                      style={{
                        color: '#81C784',
                        fontSize: 12,
                      }}
                    >
                      Fibra: {fibra}g
                    </Text>

                  </View>

                </View>

                <TouchableOpacity
                  onPress={() =>
                    removerAlimento(item.id)
                  }

                  style={{
                    backgroundColor: '#FF5555',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignSelf: 'flex-end',
                    paddingHorizontal: 14,
                    marginTop: 10,
                  }}
                >

                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    Remover
                  </Text>

                </TouchableOpacity>

              </View>
            );
          }}

          ListFooterComponent={() =>

            refeicao.alimentos.length > 0 ? (

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

                <Text
                  style={{
                    color: '#4CAF50',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  + Adicionar Alimento
                </Text>

              </TouchableOpacity>

            ) : null
          }

          ListEmptyComponent={() => (

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 30,
              }}
            >

              <Image
                source={require('@/assets/images/refeicao-vazia.png')}

                style={{
                  width: 200,
                  height: 200,
                  marginBottom: 10,
                  opacity: 0.9,
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
                Sua refeição está vazia
              </Text>

              <Text
                style={{
                  color: '#aaa',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Adicione alimentos para montar sua refeição
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

                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  Adicionar Alimento
                </Text>

              </TouchableOpacity>

            </View>
          )}
        />

        {refeicao.alimentos.length > 0 && !keyboardAberto && (

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,

              backgroundColor: '#121212',

              padding: 18,

              borderTopWidth: 1,

              borderTopColor: '#333',
            }}
          >

            <Text
              style={{
                color: 'white',
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {totais.kcal.toFixed(0)} kcal
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >

              <Text
                style={{
                  color: '#FF6B6B',
                  fontSize: 12,
                }}
              >
                Prot: {totais.prot.toFixed(1)}g
              </Text>

              <Text
                style={{
                  color: '#4FC3F7',
                  fontSize: 12,
                }}
              >
                Carb: {totais.carb.toFixed(1)}g
              </Text>

              <Text
                style={{
                  color: '#FFD54F',
                  fontSize: 12,
                }}
              >
                Gord: {totais.gord.toFixed(1)}g
              </Text>

              <Text
                style={{
                  color: '#81C784',
                  fontSize: 12,
                }}
              >
                Fibra: {totais.fibra.toFixed(1)}g
              </Text>

            </View>

          </View>
        )}

      </View>

    </KeyboardAvoidingView>
  );
}