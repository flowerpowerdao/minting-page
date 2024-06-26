import { writable, get } from "svelte/store";
import type { Principal } from "@dfinity/principal";
import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import { StoicIdentity } from "ic-stoic-identity";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { decodeIcrcAccount } from '@dfinity/ledger-icrc';
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import {
  staging as ext,
  createActor as createExtActor,
  idlFactory as extIdlFactory,
} from "./declarations/ext";
import {
  createActor as createIcrc1Actor,
  idlFactory as icrc1IdlFactory,
} from "./declarations/icrc1";

import {Account, _SERVICE as ICRC1_SERVICE} from "./declarations/icrc1/icrc1.did";

// we can't use the canister id from the ext declarations, as
// we don't deploy the NFT canister from within this project,
// we just reference them
import { collection } from "./collection";

export const HOST = process.env.DFX_NETWORK !== "ic" ? "http://localhost:4943" : "https://icp0.io";
const ledgerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const seedCanisterId = "fua74-fyaaa-aaaan-qecrq-cai";

type State = {
  isAuthed: "plug" | "stoic" | "bitfinity" | null;
  extActor: typeof ext;
  icpActor: ActorSubclass<ICRC1_SERVICE>;
  seedActor: ActorSubclass<ICRC1_SERVICE>;
  principal: Principal;
  accountId: string;
  error: string;
  isLoading: boolean;
  isBuying: boolean;
  balance: number;
  seedBalance: number;
};

const defaultState: State = {
  isAuthed: null,
  extActor: createExtActor(collection.canisterId, {
    agentOptions: { host: HOST },
  }),
  icpActor: createIcrc1Actor(ledgerCanisterId, {
    agentOptions: { host: HOST },
  }),
  seedActor: createIcrc1Actor(seedCanisterId, {
    agentOptions: { host: HOST },
  }),
  principal: null,
  accountId: "",
  error: "",
  isLoading: false,
  isBuying: false,
  balance: 0,
  seedBalance: 0,
};

export const createStore = ({
  whitelist,
  host,
}: {
  whitelist?: string[];
  host?: string;
}) => {
  const { subscribe, update } = writable<State>(defaultState);

  const checkConnections = async () => {
    await checkStoicConnection();
    await checkPlugConnection();
    await checkBitfinityConnection();
  };

  const checkStoicConnection = async () => {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        //ID is a already connected wallet!
        await stoicConnect();
      }
    });
  };

  const checkPlugConnection = async () => {
    const connected = await window.ic?.plug?.isConnected();
    if (connected) {
      console.log("plug connection detected");
      await plugConnect();
    }
  };

  const checkBitfinityConnection = async () => {
    const connected = await window.ic?.bitfinityWallet?.isConnected();
    if (connected) {
      console.log("bitfinity connection detected");
      await bitfinityConnect();
    }
  };

  const stoicConnect = async () => {
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

    const icpActor = createIcrc1Actor(ledgerCanisterId, {
      agentOptions: {
        identity,
        host: HOST,
      },
    });

    const seedActor = createIcrc1Actor(seedCanisterId, {
      agentOptions: {
        identity,
        host: HOST,
      },
    });

    if (!extActor || !icpActor) {
      console.warn("couldn't create actors");
      return;
    }

    // the stoic agent provides an `accounts()` method that returns
    // accounts assocaited with the principal
    let accounts = JSON.parse(await identity.accounts());

    update((state) => ({
      ...state,
      extActor,
      icpActor,
      seedActor,
      principal: identity.getPrincipal(),
      accountId: accounts[0].address, // we take the default account associated with the identity
      isAuthed: "stoic",
    }));

    await Promise.all([
      updateBalance(),
      updateSeedBalance(),
    ]);
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

    const extActor = (await window.ic?.plug.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extIdlFactory,
    })) as typeof ext;

    const icpActor = (await window.ic?.plug.createActor({
      canisterId: ledgerCanisterId,
      interfaceFactory: icrc1IdlFactory,
    })) as ActorSubclass<ICRC1_SERVICE>;

    const seedActor = (await window.ic?.plug.createActor({
      canisterId: seedCanisterId,
      interfaceFactory: icrc1IdlFactory,
    })) as ActorSubclass<ICRC1_SERVICE>;

    if (!extActor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.plug.agent.getPrincipal();

    update((state) => ({
      ...state,
      extActor,
      icpActor,
      seedActor,
      principal,
      accountId: window.ic.plug.sessionManager.sessionData.accountId,
      isAuthed: "plug",
    }));

    await Promise.all([
      updateBalance(),
      updateSeedBalance(),
    ]);

    console.log("plug is authed");
  };

  const bitfinityConnect = async () => {
    // check if bitfinity is installed in the browser
    if (window.ic?.bitfinityWallet === undefined) {
      window.open("https://wallet.infinityswap.one/", "_blank");
      return;
    }

    // check if bitfinity is connected
    const bitfinityConnected = await window.ic?.bitfinityWallet?.isConnected();
    if (!bitfinityConnected) {
      try {
        await window.ic?.bitfinityWallet.requestConnect({ whitelist });
        console.log("bitfinity connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    await initBitfinity();
  };

  const initBitfinity = async () => {
    const extActor = (await window.ic.bitfinityWallet.createActor({
      canisterId: collection.canisterId,
      interfaceFactory: extIdlFactory,
    })) as typeof ext;

    const icpActor = (await window.ic.bitfinityWallet.createActor({
      canisterId: ledgerCanisterId,
      interfaceFactory: icrc1IdlFactory,
    })) as ActorSubclass<ICRC1_SERVICE>;

    const seedActor = (await window.ic.bitfinityWallet.createActor({
      canisterId: seedCanisterId,
      interfaceFactory: icrc1IdlFactory,
    })) as ActorSubclass<ICRC1_SERVICE>;

    if (!extActor || !icpActor || !seedActor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.bitfinityWallet.getPrincipal();
    const accountId = await window.ic.bitfinityWallet.getAccountID();

    update((state) => ({
      ...state,
      extActor,
      icpActor,
      seedActor,
      principal,
      accountId,
      isAuthed: "bitfinity",
    }));

    await Promise.all([
      updateBalance(),
      updateSeedBalance(),
    ]);

    console.log("bitfinity is authed");
  };

  async function updateBalance() {
    const store = get({ subscribe });
    let balance: number;

    if (store.isAuthed === "plug") {
      let res = await store.icpActor.icrc1_balance_of({
        owner: store.principal,
        subaccount: [],
      });
      balance = Number(res / 1_000_000n) / 100;
    } else if (store.isAuthed === "stoic") {
      let res = await store.icpActor.account_balance({
        account: AccountIdentifier.fromHex(store.accountId).toNumbers(),
      });
      balance = Number(res.e8s / 1_000_000n) / 100;
    } else if (store.isAuthed === "bitfinity") {
      if (process.env.DFX_NETWORK !== "ic") {
        let res = await store.icpActor.account_balance({
          account: AccountIdentifier.fromHex(store.accountId).toNumbers(),
        });
        balance = Number(res.e8s / 1_000_000n) / 100;
      } else {
        let result = await window.ic.bitfinityWallet.getUserAssets();
        let ICP = result.find((asset) => asset.symbol === "ICP");
        balance = Number(BigInt(ICP.balance) / 1_000_000n) / 100;
      }
    }
    console.log("balance", balance);
    update((prevState) => ({ ...prevState, balance }));
  }

  async function updateSeedBalance() {
    const store = get({ subscribe });

    if (!store.isAuthed) {
      return;
    }

    let res = await store.seedActor.icrc1_balance_of({
      owner: store.principal,
      subaccount: [],
    });
    let balance = Number(res / 1_000_000n) / 100;
    console.log("balance SEED", balance);
    update((prevState) => ({ ...prevState, seedBalance: balance }));
  }

  async function transfer(actor: ActorSubclass<ICRC1_SERVICE>, toAddress: string, amount: bigint) {
    const store = get({subscribe});
    let toAccount = decodeIcrcAccount(toAddress);

    console.log("transfer...");
    let res = await actor.icrc1_transfer({
      from_subaccount: [],
      to: {
        owner: toAccount.owner,
        subaccount: toAccount.subaccount ? [toAccount.subaccount] : [],
      },
      amount: amount,
      fee: [],
      memo: [],
      created_at_time: [],
    });
    console.log("sent", res);

    updateBalance().then(() => {
      console.log("updated balance");
    });
  }

  const disconnect = async () => {
    const store = get({ subscribe });
    if (store.isAuthed === "stoic") {
      StoicIdentity.disconnect();
    } else if (store.isAuthed === "plug") {
      // awaiting this fails, promise never returns
      window.ic.plug.disconnect();
    } else if (store.isAuthed === "bitfinity") {
      await window.ic.bitfinityWallet.disconnect();
    }

    console.log("disconnected");

    update((prevState) => {
      return {
        ...defaultState,
      };
    });
  };

  async function getTokens() {
    const store = get({subscribe});
    let res = await store.extActor.tokens(store.accountId);
    if ('ok' in res) {
      return res.ok;
    }
    return [];
  }

  return {
    subscribe,
    update,
    plugConnect,
    stoicConnect,
    bitfinityConnect,
    disconnect,
    transfer,
    checkConnections,
    getTokens,
  };
};

export const store = createStore({
  whitelist: [
    collection.canisterId,
    ledgerCanisterId,
    seedCanisterId,
  ],
  host: HOST,
});

declare global {
  interface Window {
    ic: {
      bitfinityWallet: {
        requestConnect: (options?: {
          whitelist?: string[];
          timeout?: number;
        }) => Promise<{ derKey: Buffer; rawKey: Buffer }>;
        isConnected: () => Promise<boolean>;
        createActor: (options: {
          canisterId: string;
          interfaceFactory: InterfaceFactory;
          host?: string;
        }) => Promise<Actor>;
        getPrincipal: () => Promise<Principal>;
        disconnect: () => Promise<boolean>;
        getAccountID: () => Promise<string>;
        getUserAssets: () => Promise<
          {
            id: string;
            name: string;
            fee: string;
            symbol: string;
            balance: string;
            decimals: number;
            hide: boolean;
            isTestToken: boolean;
            logo: string;
            standard: string;
          }[]
        >;
      };
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
        createActor: (options: {}) => Promise<Actor>;
        isConnected: () => Promise<boolean>;
        disconnect: () => Promise<void>;
        createAgent: (args?: {
          whitelist: string[];
          host?: string;
        }) => Promise<undefined>;
        // requestBalance: () => Promise<
        //   Array<{
        //     amount: number;
        //     canisterId: string | null;
        //     image: string;
        //     name: string;
        //     symbol: string;
        //     value: number | null;
        //   }>
        // >;
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
