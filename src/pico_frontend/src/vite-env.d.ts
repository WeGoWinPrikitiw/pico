/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CANISTER_ID_NFT_CONTRACT?: string;
  readonly CANISTER_ID_OPERATIONAL_CONTRACT?: string;
  readonly CANISTER_ID_TOKEN_CONTRACT?: string;
  readonly CANISTER_ID_PREFERENCES_CONTRACT?: string;
  readonly CANISTER_ID_FORUMS_CONTRACT?: string;
  readonly CANISTER_ID_AI_CONTRACT?: string;
  readonly CANISTER_ID_ICRC1_LEDGER_CANISTER?: string;
  readonly CANISTER_ID_INTERNET_IDENTITY?: string;
  readonly CANISTER_ID_PICO_FRONTEND?: string;
  readonly DFX_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
