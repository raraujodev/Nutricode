import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import {
  Slot,
  usePathname,
  useRouter,
} from 'expo-router';

import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function LayoutTelas() {

  const router =
    useRouter();

  const pathname =
    usePathname();

  function isActive(
    rota: string
  ) {
    return pathname === rota;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'bottom',
      ]}
    >

      <View style={styles.content}>
        <Slot />
      </View>

      {/* =========================
          BOTTOM BAR
      ========================= */}

      <View style={styles.bottomBar}>

        {/* HOME */}

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            router.push(
              '/telas/telaHome/page'
            )
          }
        >

          <Ionicons
            name="home"
            size={24}
            color={
              isActive(
                '/telas/telaHome/page'
              )
                ? Colors.green
                : Colors.white
            }
          />

          <Text
            style={[
              styles.iconLabel,
              {
                color:
                  isActive(
                    '/telas/telaHome/page'
                  )
                    ? Colors.green
                    : Colors.white,
              },
            ]}
          >
            Home
          </Text>

        </TouchableOpacity>

        {/* DIETA */}

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            router.push(
              '/telas/telaDieta/page'
            )
          }
        >

          <Ionicons
            name="restaurant"
            size={24}
            color={
              isActive(
                '/telas/telaDieta/page'
              )
                ? Colors.green
                : Colors.white
            }
          />

          <Text
            style={[
              styles.iconLabel,
              {
                color:
                  isActive(
                    '/telas/telaDieta/page'
                  )
                    ? Colors.green
                    : Colors.white,
              },
            ]}
          >
            Dieta
          </Text>

        </TouchableOpacity>

        {/* TREINO */}

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            router.push(
              '/telas/telaTreino/page'
            )
          }
        >

          <Ionicons
            name="barbell"
            size={24}
            color={
              isActive(
                '/telas/telaTreino/page'
              )
                ? Colors.green
                : Colors.white
            }
          />

          <Text
            style={[
              styles.iconLabel,
              {
                color:
                  isActive(
                    '/telas/telaTreino/page'
                  )
                    ? Colors.green
                    : Colors.white,
              },
            ]}
          >
            Treino
          </Text>

        </TouchableOpacity>

        {/* ÁGUA */}

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            router.push(
              '/telas/telaAgua/page'
            )
          }
        >

          <Ionicons
            name="water-outline"
            size={24}
            color={
              isActive(
                '/telas/telaAgua/page'
              )
                ? Colors.green
                : Colors.white
            }
          />

          <Text
            style={[
              styles.iconLabel,
              {
                color:
                  isActive(
                    '/telas/telaAgua/page'
                  )
                    ? Colors.green
                    : Colors.white,
              },
            ]}
          >
            Água
          </Text>

        </TouchableOpacity>

        {/* CONFIG */}

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            router.push(
              '/telas/telaConfig/page'
            )
          }
        >

          <Ionicons
            name="settings-outline"
            size={24}
            color={
              isActive(
                '/telas/telaConfig/page'
              )
                ? Colors.green
                : Colors.white
            }
          />

          <Text
            style={[
              styles.iconLabel,
              {
                color:
                  isActive(
                    '/telas/telaConfig/page'
                  )
                    ? Colors.green
                    : Colors.white,
              },
            ]}
          >
            Config
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        Colors.black,
    },

    content: {
      flex: 1,
      backgroundColor: Colors.black,
    },

    bottomBar: {
      flexDirection: 'row',

      justifyContent:
        'space-around',

      alignItems: 'center',

      backgroundColor:
        '#111',

      paddingTop: 10,

      paddingBottom: 18,

      borderTopWidth: 1,

      borderTopColor:
        '#222',
    },

    iconContainer: {
      width: 68,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    iconLabel: {
      color: Colors.white,

      fontSize: 11,

      marginTop: 4,

      fontWeight: '500',
    },
  });