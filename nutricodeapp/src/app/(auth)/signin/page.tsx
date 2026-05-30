import Colors from '@/constants/Colors';
import { login } from '@/src/services/authService';
import { getUserInfo } from '@/src/services/userService';
import { pegarUsuario } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Logar() {
  const [email, setEmail] =
    useState('');
  const [senha, setSenha] =
    useState('');
  const [
    mostrarSenha,
    setMostrarSenha
  ] = useState(false);
  const [mensagem, setMensagem] =
    useState<{
      texto: string;
      tipo:
      | 'erro'
      | 'sucesso'
      | '';
    }>({
      texto: '',
      tipo: '',
    });
  const [loading, setLoading] =
    useState(false);
  const router = useRouter();
  async function VerificaLogin() {
    setMensagem({
      texto: '',
      tipo: '',
    });
    if (!email || !senha) {
      setMensagem({
        texto:
          'Preencha todos os campos.',
        tipo: 'erro',
      });
      return;
    }
    setLoading(true);
    try {
      /* 
         LOGIN
      */
      await login(
        email,
        senha
      );
      /* 
         USER SALVO
     */
      const user =
        await pegarUsuario();
      const userId =
        user?.id ||
        user?.userId;
      if (!userId) {
        throw new Error(
          'Usuário não encontrado após login'
        );
      }
  /* 
         USER INFO
   */
      let info = null;
      try {
        info =
          await getUserInfo(
            userId
          );
      } catch (e) {
        console.log(
          '⚠️ erro ao buscar info'
        );
      }
      setMensagem({
        texto:
          'Login realizado com sucesso!',
        tipo: 'sucesso',
      });
      setTimeout(() => {
        if (
          info?.height &&
          info?.sex
        ) {
          router.replace(
            '/telas/telaHome/page'
          );
        } else {
          router.replace(
            '/onboarding/page'
          );
        }
      }, 800);
    } catch (err: any) {
      console.log('STATUS:', err.status, err.statusCode, err.response?.status);
      console.log('MESSAGE:', err.message);

      const status =
        err.status ??
        err.statusCode ??
        err.response?.status;
      const message = err.message ?? '';

      let msg = 'Erro ao fazer login';

      if (
        status === 403 ||
        (message.includes('403') && !message.includes('400') && !message.includes('401'))
      ) {
        msg = 'Confirme seu email antes de logar';
      } else if (
        status === 400 ||
        status === 401 ||
        status === 404 ||
        message.includes('400') ||
        message.includes('401') ||
        message.includes('404')
      ) {
        msg = 'Email ou senha incorretos';
      }

      setMensagem({
        texto: msg,
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* LOGO */}
            <Image
              source={require('@/assets/images/mascoteLogin.png')}
              style={
                styles.logoImage
              }
            />
            <Text style={styles.logoText}>
              Nutri
              <Text
                style={{
                  color:
                    Colors.white
                }}
              >
                Code
              </Text>
            </Text>
            <Text
              style={
                styles.mensagemInicial
              }
            >
              Bem-vindo!
            </Text>
            {/* FORM */}
            <View style={styles.form}>
              {/* EMAIL */}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={
                  Colors.black
                }
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              {/* SENHA */}
              <View
                style={
                  styles.inputContainer
                }
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      marginBottom: 0,
                    },
                  ]}
                  placeholder="Senha"
                  placeholderTextColor={
                    Colors.black
                  }
                  value={senha}
                  onChangeText={
                    setSenha
                  }
                  secureTextEntry={
                    !mostrarSenha
                  }
                />
                <TouchableOpacity
                  onPress={() =>
                    setMostrarSenha(
                      !mostrarSenha
                    )
                  }
                >
                  <Ionicons
                    name={
                      mostrarSenha
                        ? 'eye-off'
                        : 'eye'
                    }
                    size={22}
                    color={
                      Colors.black
                    }
                  />
                </TouchableOpacity>
              </View>
              {/* MENSAGEM */}
              {!!mensagem.texto && (
                <Text
                  style={{
                    color:
                      mensagem.tipo ===
                        'erro'
                        ? 'red'
                        : 'lightgreen',
                    textAlign:
                      'center',
                    marginBottom: 10,
                  }}
                >
                  {mensagem.texto}
                </Text>
              )}
              {/* BOTÃO */}
              <TouchableOpacity
                style={[
                  styles.button,
                  loading && {
                    opacity: 0.7,
                  },
                ]}
                onPress={
                  VerificaLogin
                }
                disabled={loading}
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {loading
                    ? 'Entrando...'
                    : 'Logar'}
                </Text>
              </TouchableOpacity>
              {/* CADASTRO */}
              <Text
                style={
                  styles.signupText
                }
                onPress={() =>
                  router.push(
                    '/(auth)/signup/page'
                  )
                }
              >
                Não possui uma conta?
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.black,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent:
      'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.green,
  },
  mensagemInicial: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor:
      Colors.green,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    color: Colors.black,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      Colors.green,
    borderRadius: 12,
    marginBottom: 14,
    paddingRight: 10,
  },
  button: {
    backgroundColor:
      Colors.orange,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 16,
  },
  signupText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 15,
  },
});