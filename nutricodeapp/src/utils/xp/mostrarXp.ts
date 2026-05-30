import { tocarXp } from "./tocarXp";

type MostrarXpProps = {
  xp: number;
  setXpGanho: (xp: number) => void;
  setModalXpVisible: (visible: boolean) => void;
};

export async function mostrarXp({
  xp,
  setXpGanho,
  setModalXpVisible,
}: MostrarXpProps) {

  setXpGanho(xp);

  setModalXpVisible(true);

  await tocarXp();

  setTimeout(() => {

    setModalXpVisible(false);

  }, 3000);
}