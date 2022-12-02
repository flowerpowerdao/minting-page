import { writable, get } from "svelte/store";
import type { Principal } from "@dfinity/principal";
import { Actor, HttpAgent, type Identity } from "@dfinity/agent";
import { StoicIdentity } from "ic-stoic-identity";
import { createActor, idlFactory } from "./declarations/ext";
import { default as ledgerIdlFactory } from "./declarations/ledger/ledger.did";
import type { _SERVICE as ExtActor } from "./declarations/ext/staging.did";
import { canisterId } from "./collection";

export const HOST =
    process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://ic0.app";

type Filters = {
    open: boolean;
    adopted: boolean;
    rejected: boolean;
};

type State = {
    isAuthed: "plug" | "stoic" | null;
    extActor: ExtActor;
    ledgerActor: any;
    principal: Principal;
    accountId: string;
    error: string;
    isLoading: boolean;
};

export type NewProposal = {
    title: string;
    description: string;
    options: string[];
};

const defaultState: State = {
    isAuthed: null,
    extActor: createActor(canisterId, { agentOptions: { host: HOST } }),
    ledgerActor: null,
    principal: null,
    accountId: "",
    error: "",
    isLoading: false,
};

export const createStore = ({
    whitelist,
    host,
}: {
    whitelist?: string[];
    host?: string;
}) => {
    const { subscribe, update } = writable<State>(defaultState);

    let isConnectedPromise: Promise<boolean>;
    let connected: boolean = null;
    const isConnected = () => {
        if (connected != null) {
            return connected;
        }
        // prevent opening multiple Plug modals
        if (isConnectedPromise) {
            return isConnectedPromise;
        }
        isConnectedPromise = checkIsConnected()
            .then((val) => {
                connected = val;
                return val;
            })
            .finally(() => {
                isConnectedPromise = null;
            });
        return isConnectedPromise;
    };

    const checkIsConnected = async () => {
        let plugConnected = await window.ic?.plug?.isConnected();
        if (plugConnected) {
            await initPlug();
            return true;
        }

        let stoicIdentity = await StoicIdentity.load();
        if (stoicIdentity) {
            await initStoic(stoicIdentity);
        }

        return stoicIdentity !== false;
    };

    const stoicConnect = () => {
        StoicIdentity.load().then(async (identity) => {
            if (identity !== false) {
                // ID is a already connected wallet!
            } else {
                // No existing connection, lets make one!
                identity = await StoicIdentity.connect();
            }
            initStoic(identity);
            connected = true;
        });
    };

    const initStoic = async (identity: Identity & { accounts(): string }) => {
        console.trace("initStoic");
        const actor = createActor(canisterId, {
            agentOptions: {
                identity,
                host: HOST,
            },
        });

        if (!actor) {
            console.warn("couldn't create actors");
            return;
        }

        let accounts = JSON.parse(await identity.accounts());
        update((state) => ({
            ...state,
            principal: identity.getPrincipal(),
            accountId: accounts[0].address,
        }));

        const ledgerActor = Actor.createActor(ledgerIdlFactory, {
            agent: new HttpAgent({
                host: HOST,
                identity: identity,
            }),
            canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        });

        update((state) => ({
            ...state,
            extActor: actor,
            ledgerActor: ledgerActor,
            principal: identity.getPrincipal(),
            isAuthed: "stoic",
        }));
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
        connected = true;
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
        if (process.env.NODE_ENV !== "production") {
            window.ic.plug.agent.fetchRootKey().catch((err) => {
                console.warn(
                    "Unable to fetch root key. Check to ensure that your local replica is running"
                );
                console.error(err);
            });
        }

        const extActor = (await window.ic?.plug.createActor({
            canisterId: canisterId,
            interfaceFactory: idlFactory,
        })) as ExtActor;

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

        console.log("plug is authed");
    };

    async function transfer(toAddress: string, amount: bigint) {
        let state = get(store);

        if (state.isAuthed === "plug") {
            let hight = await window.ic.plug.requestTransfer({
                to: toAddress,
                amount: Number(amount),
                opts: {
                    fee: 10000,
                },
            });
            console.log("sent", hight);
        } else if (state.isAuthed === "stoic") {
            let args = {
                from_subaccount: [],
                to: toAddress,
                amount: { e8s: amount },
                fee: { e8s: 10000 },
                memo: 0,
                created_at_time: [],
            };
            console.log("send_dfx...");
            let res = await state.ledgerActor.send_dfx(args);
            console.log("sent", res);
        }
    }

    const disconnect = async () => {
        console.log("disconnected");
        StoicIdentity.disconnect();
        window.ic?.plug?.disconnect();
        // wait for 500ms to ensure that the disconnection is complete
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("plug status: ", await window.ic?.plug?.isConnected());

        isConnectedPromise = null;
        connected = null;

        update((prevState) => {
            return {
                ...defaultState,
            };
        });
    };

    return {
        subscribe,
        update,
        isConnected,
        plugConnect,
        stoicConnect,
        disconnect,
        transfer,
    };
};

export const store = createStore({
    whitelist: [
        canisterId,
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
                createActor: (options: {}) => Promise<ExtActor>;
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
                        memo?: number;
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
