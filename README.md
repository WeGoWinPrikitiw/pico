# PICO
{Explanation}

# Background
{Background}

# Tech stacks & Features Implementation
{Tech stack}
{Feature}
- `operational_contract` - Your main business logic with `PiCO` token operations
- `icrc1_ledger_canister` - our ICRC-1 tokens which called `PiCO`
- `icrc2_ledger_canister` - our approval method for sending token
- `icrc7`
- http outcalls & open ai integration - text to image
- ollama motoko implementation
- `pico_frontend` - Your frontend (depends on operational_contract)
- `internet_identity` - Authentication

# Tech Details & Diagram
{Diagram}
{Explanation}

# How to run/develop locally
1. Generate Canister ID for contracts
```
dfx canister create --all
```
Output:
```
ai_contract canister created with canister id: uxrrr-q7777-77774-qaaaq-cai
forums_contract canister created with canister id: u6s2n-gx777-77774-qaaba-cai
icrc1_ledger_canister canister created with canister id: uzt4z-lp777-77774-qaabq-cai
internet_identity canister created with canister id: rdmx6-jaaaa-aaaaa-aaadq-cai
nft_contract canister created with canister id: umunu-kh777-77774-qaaca-cai
operational_contract canister created with canister id: ulvla-h7777-77774-qaacq-cai
pico_frontend canister created with canister id: ucwa4-rx777-77774-qaada-cai
preferences_contract canister created with canister id: ufxgi-4p777-77774-qaadq-cai
token_contract canister created with canister id: vizcg-th777-77774-qaaea-cai
```

2. Change variable contracts inside `config.mo` by replace output
3. Change `"init_art"` in `dfx.json`
```
"icrc1_ledger_canister": {
      "type": "custom",
      "candid": "icrc1_ledger.did",
      "wasm": "icrc1_ledger.wasm.gz",
      "init_arg": "(variant { Init = record { token_symbol = \"PiCO\"; token_name = \"PiCO\"; minting_account = record { owner = principal \"umunu-kh777-77774-qaaca-cai\" }; transfer_fee = 10_000; metadata = vec {}; feature_flags = opt record { icrc2 = true }; initial_balances = vec { record { record { owner = principal \"umunu-kh777-77774-qaaca-cai\" }; 100_000_000_000_000 } }; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; controller_id = principal \"igjqa-zhtmo-qhppn-eh7lt-5viq5-4e5qj-lhl7n-qd2fz-2yzx2-oczyc-tqe\"; cycles_for_archive_creation = opt 10_000_000_000_000 } } })"
    }
```
- Change minting_account owner principal using operational_contract canister id
```minting_account = record { owner = principal \"{OPERATIONAL_CONTRACT_CANISTER_ID}\" }```
- Change initial balances & controller ID by principal that you want.
```
initial_balances = vec { record { record { owner = principal \"{YOUR_INIT_BALANCE_PRINCIPAL_ID}" }; 100_000_000_000_000 } }; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; controller_id = principal \"{YOUR_PRINCIPAL_CONTROLLER_ID}"
```
3.  Deploy it by running this:
```dfx deploy```
4. You will get canister UI Backend & Frontend
5. If you want hot reload frontend development, you can run this on terminal
```npm run start```
6. Open localhost that show up in terminal

# Deployed Canisters
- Mainnet URLs:
- Frontend
- Backend

# Team Participants
{Team Participants}