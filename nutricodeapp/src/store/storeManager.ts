import { createDietaStore } from './dietaStore';

let dietaStore: any = null;

export function getDietaStore(userId: string) {
  if (!dietaStore) {
    dietaStore = createDietaStore(userId);
  }

  return dietaStore;
}

export function resetStores() {
  dietaStore = null;
}