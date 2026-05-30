import Colors from '@/constants/Colors';
import { register } from '@/src/services/authService';
import { enviarEmailConfirmacao } from '@/src/services/emailService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Registrar() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'erro' | 'sucesso' | '' }>({
    texto: '',
    tipo: '',
  });

  function validarSenha(senha: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
  }

  function validarUsername(username: string) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }

  async function VerificaRegistro() {
    setMensagem({ texto: '', tipo: '' });

    const usernameLimpo = username.trim();
    const emailLimpo = email.trim();

    if (!usernameLimpo || !emailLimpo || !senha || !confirmarSenha) {
      setMensagem({ texto: 'Preencha todos os campos.', tipo: 'erro' });
      return;
    }

    if (!validarUsername(usernameLimpo)) {
      setMensagem({ texto: 'Username inválido.', tipo: 'erro' });
      return;
    }

    if (!validarSenha(senha)) {
      setMensagem({
        texto: 'Senha fraca (8+, maiúscula, minúscula, número).',
        tipo: 'erro',
      });
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem({ texto: 'As senhas não coincidem.', tipo: 'erro' });
      return;
    }

    try {
      const data = await register(usernameLimpo, emailLimpo, senha);

      await enviarEmailConfirmacao({
        email: emailLimpo,
        username: usernameLimpo,
        token: data.confirmationToken,
      });

      setMensagem({
        texto: 'Conta criada! Verifique seu email.',
        tipo: 'sucesso',
      });

      setTimeout(() => {
        router.replace('/(auth)/signin/page');
      }, 2000);

    } catch (err: any) {
      setMensagem({
        texto: err.message || 'Erro ao cadastrar',
        tipo: 'erro',
      });
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.black,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 0
            : 25
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            paddingBottom: 60,
          }}
        >

          <Image
            source={require('@/assets/images/mascoteLogin.png')}
            style={{
              width: 150,
              height: 150,
              marginBottom: 10,
            }}
          />

          <Text
            style={{
              fontSize: 30,
              color: Colors.green,
              fontWeight: 'bold',
            }}
          >
            Nutri
            <Text style={{ color: Colors.white }}>
              Code
            </Text>
          </Text>

          <View
            style={{
              width: '100%',
              marginTop: 20,
            }}
          >

            <TextInput
              placeholder="Username"
              placeholderTextColor={Colors.black}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor={Colors.black}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            {/* SENHA */}
            <View style={styles.inputContainer}>

              <TextInput
                placeholder="Senha"
                placeholderTextColor={Colors.black}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!verSenha}
                style={{
                  flex: 1,
                  color: Colors.black,
                  fontSize: 15,
                  height: '100%',
                }}
              />

              <TouchableOpacity
                onPress={() =>
                  setVerSenha(!verSenha)
                }
              >
                <Ionicons
                  name={
                    verSenha
                      ? 'eye-off'
                      : 'eye'
                  }
                  size={22}
                  color={Colors.black}
                />
              </TouchableOpacity>

            </View>

            {/* CONFIRMAR SENHA */}
            <View style={styles.inputContainer}>

              <TextInput
                placeholder="Confirmar senha"
                placeholderTextColor={Colors.black}
                value={confirmarSenha}
                onChangeText={
                  setConfirmarSenha
                }
                secureTextEntry={
                  !verConfirmarSenha
                }
                style={{
                  flex: 1,
                  color: Colors.black,
                  fontSize: 15,
                }}
              />

              <TouchableOpacity
                onPress={() =>
                  setVerConfirmarSenha(
                    !verConfirmarSenha
                  )
                }
              >
                <Ionicons
                  name={
                    verConfirmarSenha
                      ? 'eye-off'
                      : 'eye'
                  }
                  size={22}
                  color={Colors.black}
                />
              </TouchableOpacity>

            </View>

            {!!mensagem.texto && (

              <Text
                style={{
                  color:
                    mensagem.tipo === 'erro'
                      ? 'red'
                      : 'lightgreen',
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {mensagem.texto}
              </Text>

            )}

            <TouchableOpacity
              onPress={VerificaRegistro}
              style={{
                backgroundColor:
                  Colors.orange,
                padding: 16,
                borderRadius: 12,
                marginTop: 10,
                alignItems: 'center',
              }}
            >

              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: Colors.black,
                }}
              >
                Cadastrar
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.green,
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  input: {
    backgroundColor: Colors.green,
    paddingHorizontal: 14,
    height: 54,
    borderRadius: 12,
    marginBottom: 14,
    color: Colors.black,
    fontSize: 15,
  },
};