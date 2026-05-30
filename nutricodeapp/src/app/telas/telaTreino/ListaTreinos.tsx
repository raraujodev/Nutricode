import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { DiaTreino } from '@/src/types/Treino';

type Props = {
  dias: DiaTreino[];
  selecionar: (dia: DiaTreino) => void;
  concluirDia: (id: string) => void;
};

export default function ListaTreinos({
  dias,
  selecionar,
  concluirDia,
}: Props) {

  const diasSemana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f', padding: 20 }}>

      <Text
        style={{
          color: 'white',
          fontSize: 26,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        Meus Treinos
      </Text>

      <FlatList
        data={dias}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {

          const totalExercicios = item.exercicios.length;

          const musculos = [
            ...new Set(
              item.exercicios.flatMap(
                (e) => e.exercicio.primaryMuscles || []
              )
            ),
          ];

       
          const isHoje = item.nome === hoje;



          const jaConcluidoHoje = item.lastCompletedDate === hoje;

          const podeConcluir =
            item.nome === diasSemana[new Date().getDay()] && !jaConcluidoHoje;

          return (
            <TouchableOpacity
              onPress={() => selecionar(item)}
              style={{
                backgroundColor: '#1c1c1c',
                padding: 18,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {item.nome}
              </Text>

              {totalExercicios > 0 ? (
                <>
                  <Text style={{ color: '#aaa', marginTop: 4 }}>
                    {totalExercicios} exercício(s)
                  </Text>

                  <Text
                    style={{
                      color: '#4CAF50',
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {musculos.join(', ')}
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#777', marginTop: 4 }}>
                  Nenhum exercício
                </Text>
              )}

              {/* BOTÃO CONCLUIR  */}

              {podeConcluir && (
                <TouchableOpacity
                  onPress={() => concluirDia(item.id)}
                  style={{
                    marginTop: 12,
                    backgroundColor: '#4CAF50',
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Concluir treino
                  </Text>
                </TouchableOpacity>
              )}

              {jaConcluidoHoje && (
                <Text
                  style={{
                    marginTop: 10,
                    color: '#4CAF50',
                    fontWeight: 'bold',
                  }}
                >
                  Concluído hoje ✔
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}