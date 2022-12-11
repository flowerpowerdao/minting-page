import { writable, get } from "svelte/store";
import type { Principal } from "@dfinity/principal";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { StoicIdentity } from "ic-stoic-identity";
import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import {
  ext,
  createActor as createExtActor,
  idlFactory as extIdlFactory,
} from "./declarations/ext";
import {
  ledger,
  createActor as createLedgerActor,
  idlFactory as ledgerIdlFactory,
  canisterId as ledgerCanisterId,
} from "./declarations/ledger";

// we can't use the canister id from the ext declarations, as
// we don't deploy the NFT canister from within this project,
// we just reference them
import { collection } from "./collection";

export const HOST =
  process.env.DFX_NETWORK !== "ic"
    ? "http://localhost:4943"
    : "https://ic0.app";

type State = {
  isAuthed: "plug" | "stoic" | null;
  extActor: typeof ext;
  ledgerActor: typeof ledger;
  principal: Principal;
  accountId: string;
  error: string;
  isLoading: boolean;
  isBuying: boolean;
  balance: number;
};

const defaultState: State = {
  isAuthed: null,
  extActor: createExtActor(collection.canisterId, {
    agentOptions: { host: HOST },
  }),
  ledgerActor: createLedgerActor(ledgerCanisterId, {
    agentOptions: { host: HOST },
  }),
  principal: null,
  accountId: "",
  error: "",
  isLoading: false,
  isBuying: false,
  balance: 0,
};

export const createStore = ({
  whitelist,
  host,
}: {
  whitelist?: string[];
  host?: string;
}) => {
  const { subscribe, update } = writable<State>(defaultState);

  const stoicConnect = () => {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        // ID is a already connected wallet!
      } else {
        // No existing connection, lets make one!
        identity = await StoicIdentity.connect();
      }
      initStoic(identity);
    });
  };

  const initStoic = async (identity: Identity & { accounts(): string }) => {
    console.trace("initStoic");

    const extActor = createExtActor(collection.canisterId, {
      agentOptions: {
        identity,
        host: HOST,
      },
    });

    const ledgerActor = createLedgerActor(ledgerCanisterId, {
      agentOptions: {
        identity,
        host: HOST,
      },
    });

    if (!extActor || !ledgerActor) {
      console.warn("couldn't create actors");
      return;
    }

    // the stoic agent provides an `accounts()` method that returns
    // accounts assocaited with the principal
    let accounts = JSON.parse(await identity.accounts());

    update((state) => ({
      ...state,
      extActor,
      ledgerActor,
      principal: identity.getPrincipal(),
      accountId: accounts[0].address, // we take the default account associated with the identity
      isAuthed: "stoic",
    }));

    await updateBalance();
  };

  const plugConnect = async () => {
    // check if plug is installed in the browser
    if (window.ic?.plug === undefined) {
      window.open("https://plugwallet.ooo/", "_blank");
      return;
    }

    // check if plug is connected
    const plugConnected = await window.ic?.plug?.isConnected();
    if (!plugConnected) {
      try {
        console.log({
          whitelist,
          host,
        });
        await window.ic?.plug.requestConnect({
          whitelist,
          host,
        });
        console.log("plug connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    await initPlug();
  };

  const initPlug = async () => {
    // check wether agent is present
    // if not create it
    if (!window.ic?.plug?.agent) {
      console.warn("no agent found");
      const result = await window.ic?.plug?.createAgent({
        whitelist,
        host,
      });
      result
        ? console.log("agent created")
        : console.warn("agent creation failed");
    }
    // check of if createActor method is available
    if (!window.ic?.plug?.createActor) {
      console.warn("no createActor found");
      return;
    }

    // Fetch root key for certificate validation during development
    if (process.env.DFX_NETWORK !== "ic") {
      window.ic.plug.agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key. Check to ensure that your local replica is running"
        );
        console.error(err);
      });
    }

    const extActor = (await window.ic?.plug.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extIdlFactory,
    })) as typeof ext;

    if (!extActor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.plug.agent.getPrincipal();

    update((state) => ({
      ...state,
      extActor,
      principal,
      accountId: window.ic.plug.sessionManager.sessionData.accountId,
      isAuthed: "plug",
    }));

    await updateBalance();

    console.log("plug is authed");
  };

  async function updateBalance() {
    const store = get({ subscribe });
    let balance;

    if (store.isAuthed === "plug") {
      let result = await window.ic.plug.requestBalance();
      let ICP = result.find((asset) => asset.symbol === "ICP");
      balance = ICP.amount;
    } else if (store.isAuthed === "stoic") {
      let res = await store.ledgerActor.account_balance({
        account: AccountIdentifier.fromHex(store.accountId).toNumbers(),
      });
      balance = Number(res.e8s / 100000000n);
    }
    console.log("balance", balance);
    update((prevState) => ({ ...prevState, balance }));
  }

  async function transfer(toAddress: string, amount: bigint) {
    const store = get({ subscribe });

    if (store.isAuthed === "plug") {
      let height = await window.ic.plug.requestTransfer({
        to: toAddress,
        amount: Number(amount),
        opts: {
          fee: 10000,
        },
      });
      console.log("sent", height);
    } else if (store.isAuthed === "stoic") {
      console.log("transfer...");
      let res = await store.ledgerActor.transfer({
        from_subaccount: [],
        to: AccountIdentifier.fromHex(toAddress).toNumbers(),
        amount: { e8s: amount },
        fee: { e8s: 10000n },
        memo: 0n,
        created_at_time: [],
      });
      console.log("sent", res);
    }
    await updateBalance();
    console.log("updated balance");
  }

  const disconnect = async () => {
    console.log("disconnected");
    StoicIdentity.disconnect();
    window.ic?.plug?.disconnect();
    // wait for 500ms to ensure that the disconnection is complete
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("plug status: ", await window.ic?.plug?.isConnected());

    update((prevState) => {
      return {
        ...defaultState,
      };
    });
  };

  return {
    subscribe,
    update,
    plugConnect,
    stoicConnect,
    disconnect,
    transfer,
  };
};

export const store = createStore({
  whitelist: [
    collection.canisterId,
    // 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  ],
  host: HOST,
});

declare global {
  interface Window {
    ic: {
      plug: {
        agent: HttpAgent;
        sessionManager: {
          sessionData: {
            accountId: string;
          };
        };
        getPrincipal: () => Promise<Principal>;
        deleteAgent: () => void;
        requestConnect: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<any>;
        createActor: (options: {}) => Promise<typeof ledger | typeof ext>;
        isConnected: () => Promise<boolean>;
        disconnect: () => Promise<boolean>;
        createAgent: (args?: {
          whitelist: string[];
          host?: string;
        }) => Promise<undefined>;
        requestBalance: () => Promise<
          Array<{
            amount: number;
            canisterId: string | null;
            image: string;
            name: string;
            symbol: string;
            value: number | null;
          }>
        >;
        requestTransfer: (arg: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: string;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ height: number }>;
      };
    };
  }
}

// window.store = store;
// window.get = get;
// window.StoicIdentity = StoicIdentity;
