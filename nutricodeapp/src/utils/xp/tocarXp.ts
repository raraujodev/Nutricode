import * as Haptics from "expo-haptics";

import {
  Audio,
} from "expo-av";

export async function tocarXp() {

  try {

    const chance =
      Math.random();

    let somEscolhido;

    /* =========================
       SOM RARO
    ========================= */

    if (chance < 0.15) {

      somEscolhido =
        require(
          "@/assets/sounds/xp-raro.mp3"
        );

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Heavy
      );

    } else {

      /* =========================
         SOM NORMAL
      ========================= */

      somEscolhido =
        require(
          "@/assets/sounds/xp-normal.mp3"
        );

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      /* FORÇA vibração no Android */

      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Medium
      );
    }

    const { sound } =
      await Audio.Sound.createAsync(
        somEscolhido
      );

    await sound.playAsync();

  } catch (err) {

    console.log(
      "❌ Erro som XP:",
      err
    );
  }
}