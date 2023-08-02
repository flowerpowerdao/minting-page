import { writable, get } from "svelte/store";
import { AuthStore, createAuthStore } from 'fpdao-ui/auth-store';
import { canisterId as ledgerCanisterId } from "./declarations/ledger";
import {
  staging as ext,
  createActor as createExtActor,
  idlFactory as extIdlFactory,
} from "./declarations/ext";

// we can't use the canister id from the ext declarations, as
// we don't deploy the NFT canister from within this project,
// we just reference them
import { collection } from "./collection";

export const HOST = process.env.DFX_NETWORK !== "ic" ? "http://localhost:4943" : "https://icp0.io";

type State = {
  extActor: typeof ext;
  isLoading: boolean;
  isBuying: boolean;
};

const defaultState: State = {
  extActor: createExtActor(collection.canisterId, {
    agentOptions: { host: HOST },
  }),
  isLoading: false,
  isBuying: false,
};

export const createStore = (authStore: AuthStore) => {
  const { subscribe, update } = writable<State>(defaultState);
  let curAuth = get(authStore).isAuthed;

  authStore.subscribe(async (state) => {
    if (curAuth !== state.isAuthed) {
      curAuth = state.isAuthed;

      if (curAuth == null) {
        update((prevState) => {
          return {...defaultState};
        });
      } else {
        let extActor = await authStore.createActor<typeof ext>(collection.canisterId, extIdlFactory);
        update((prevState) => {
          return {
            ...prevState,
            extActor,
          };
        });
      }
    }
  });

  subscribe((state) => {
    console.log("state", state);
  });

  return {
    subscribe,
    update,
  };
};

export const authStore = createAuthStore({
  whitelist: [collection.canisterId, ledgerCanisterId],
  host: process.env.DFX_NETWORK !== "ic" ? "http://localhost:4943" : "https://icp0.io",
});

export const store = createStore(authStore);