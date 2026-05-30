import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Refeicao } from '@/src/types/Refeicao';
import { useState, useCallback } from 'react';
type Props = {
  refeicoes: Refeicao[];
  selecionar: (
    refeicao: Refeicao
  ) => void;
  adicionarRefeicao: () => void;
  atualizarNomeRefeicao: (
    id: string,
    nome: string
  ) => void;
  removerRefeicao: (
    id: string
  ) => void;
  concluirRefeicao: (
    id: string
  ) => void;
  metaProteina: number;
  metaCalorias: number;
  totaisDia: {
    kcal: number;
    prot: number;
    carb: number;
    gord: number;
    fibra: number;
  };
};
export default function ListaRefeicoes({
  refeicoes,
  selecionar,
  adicionarRefeicao,
  atualizarNomeRefeicao,
  removerRefeicao,
  concluirRefeicao,
  totaisDia,
  metaProteina,
  metaCalorias,
}: Props) {
  const [editando, setEditando] =
    useState<string | null>(null);
  const [texto, setTexto] =
    useState('');
  function iniciarEdicao(
    id: string,
    nomeAtual: string
  ) {
    setEditando(id);
    setTexto(nomeAtual);
  }
  function salvarEdicao(
    id: string
  ) {
    if (!texto.trim()) {
      return;
    }
    atualizarNomeRefeicao(
      id,
      texto.trim()
    );
    setEditando(null);
    setTexto('');
  }
  function cancelarEdicao() {
    setEditando(null);
    setTexto('');
  }
  const temAlgumAlimento =
    refeicoes.some(
      r => r.alimentos.length > 0
    );


  const renderItem = useCallback(({ item }: { item: Refeicao }) => {
    const estaEditando = editando === item.id;
    const totaisRefeicao = item.alimentos.reduce(
      (acc, alimentoItem) => {
        const fator = alimentoItem.quantidade / 100;
        acc.kcal  += alimentoItem.alimento.kcal           * fator;
        acc.prot  += alimentoItem.alimento.protein         * fator;
        acc.carb  += alimentoItem.alimento.carbohydrates   * fator;
        acc.gord  += alimentoItem.alimento.lipids          * fator;
        acc.fibra += alimentoItem.alimento.dietaryFiber    * fator;
        return acc;
      },
      { kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0 }
    );
    return (
      <View
        style={{
          backgroundColor: '#1c1c1c',
          padding: 16,
          borderRadius: 14,
          marginBottom: 12,
          borderWidth: item.concluida ? 1.5 : 0,
          borderColor: item.concluida ? '#4CAF50' : 'transparent',
        }}
      >
        {estaEditando ? (
          <>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              autoFocus
              placeholder="Nome da refeição"
              placeholderTextColor="#777"
              style={{
                backgroundColor: '#333',
                color: 'white',
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => salvarEdicao(item.id)}
                style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 10 }}
              >
                <Text style={{ color: 'white' }}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelarEdicao}
                style={{ backgroundColor: '#555', padding: 10, borderRadius: 10 }}
              >
                <Text style={{ color: 'white' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => selecionar(item)} style={{ flex: 1 }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 17,
                  fontWeight: item.concluida ? '700' : '500',
                }}
              >
                {item.nome}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => iniciarEdicao(item.id, item.nome)}>
              <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>
          {item.alimentos.length}{' alimento(s)'}
        </Text>
        {item.alimentos.length > 0 && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: '#2a2a2a',
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: '#4CAF50',
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
              }}
            >
              {totaisRefeicao.kcal.toFixed(0)} kcal
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Text style={{ color: '#FF6B6B', fontSize: 11, fontWeight: '600' }}>
                P {totaisRefeicao.prot.toFixed(1)}g
              </Text>
              <Text style={{ color: '#4FC3F7', fontSize: 11, fontWeight: '600' }}>
                C {totaisRefeicao.carb.toFixed(1)}g
              </Text>
              <Text style={{ color: '#FFD54F', fontSize: 11, fontWeight: '600' }}>
                G {totaisRefeicao.gord.toFixed(1)}g
              </Text>
              <Text style={{ color: '#81C784', fontSize: 11, fontWeight: '600' }}>
                F {totaisRefeicao.fibra.toFixed(1)}g
              </Text>
            </View>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => concluirRefeicao(item.id)}
            style={{
              backgroundColor: item.concluida ? '#2E7D32' : '#4CAF50',
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
              {item.concluida ? '✓ Concluída' : 'Concluir'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removerRefeicao(item.id)}
            style={{
              backgroundColor: '#FF5555',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
 
  }, [refeicoes, editando, texto, concluirRefeicao, removerRefeicao, selecionar, atualizarNomeRefeicao]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0f0f0f',
        padding: 20,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 26,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        Minhas Refeições
      </Text>
      <FlatList
        data={refeicoes}
        keyExtractor={(item) => item.id}
    
        extraData={{ refeicoes, editando, concluirRefeicao, removerRefeicao }}
        contentContainerStyle={{ paddingBottom: 190 }}
        renderItem={renderItem}
        ListFooterComponent={() => (
          <TouchableOpacity
            onPress={adicionarRefeicao}
            disabled={refeicoes.length >= 6}
            style={{
              marginTop: 10,
              marginBottom: 20,
              backgroundColor: refeicoes.length >= 6 ? '#444' : '#1f3f1f',
              borderRadius: 14,
              padding: 18,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#4CAF50',
            }}
          >
            <Text
              style={{
                color: refeicoes.length >= 6 ? '#aaa' : '#4CAF50',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              + Adicionar Refeição
            </Text>
          </TouchableOpacity>
        )}
      />
      {temAlgumAlimento && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#121212',
            paddingVertical: 16,
            paddingHorizontal: 14,
            borderTopWidth: 1,
            borderTopColor: '#333',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {totaisDia.kcal.toFixed(0)}{' / '}{metaCalorias}{' kcal'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 12 }}>
              Prot: {totaisDia.prot.toFixed(1)}{' / '}{metaProteina}g
            </Text>
            <Text style={{ color: '#4FC3F7', fontSize: 12 }}>
              Carb: {totaisDia.carb.toFixed(1)}g
            </Text>
            <Text style={{ color: '#FFD54F', fontSize: 12 }}>
              Gord: {totaisDia.gord.toFixed(1)}g
            </Text>
            <Text style={{ color: '#81C784', fontSize: 12 }}>
              Fibra: {totaisDia.fibra.toFixed(1)}g
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}