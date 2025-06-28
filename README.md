# Presentation
We're suggesting to you to read the power point and watch video to better understanding about our products.

Power Point: [PowerPoints](https://www.figma.com/slides/mH7sUwO1O5SNGH1NeXvPhp/Pitch-Deck-PiCO)  <br/>
Video Demo: [Demo Link](www.youtube.com)

# PICO
Pico is a social media platform and NFT marketplace designed to empower artists in this rapidly evolving landscape by prioritizing authorship, authenticity, and transparency.

We’re building a creative space where artists can share, mint, and connectwithout the fear of being miscredited or lost in the noise of untagged AI content.


# Background
Artists put a lot of time into their work. But the moment it hits social media, "boom" everything’s gone. No name, no credit, no copyright. People just repost it like it’s theirs. And that’s messed up.

According to a report by IPTC, around 93% of images online have their metadata stripped. Platforms like Twitter remove 100% of it. Instagram and Facebook wipe out about 85 - 90%. So even if you create something amazing, once it’s out there, no one knows it’s yours.

That’s why we built PiCO, a platform where your art stays yours. It keeps the name, the proof, and the credit, whether it's AI-generated, hand-drawn, or anything in between. And yeah, if you want, you can mint it as an NFT. But more importantly, your name stays with your work. Always.

# Tech stacks & Features Implementation
{Tech stack}
- Frontend: 
  - React
  - Vite.
  - React Context
  - Layered Services Architecture Design
  - React Query
- Backend:
  - Motoko 
  - Open AI
  - Cloudflare R2
  - Http outcalls
  - ICRC7 & NFT
  - Decentralized AI memakai LLM Canister Ollama
  - Memakai HTTP Outcalls AI Open AI Sora
  - Bikin token ICP ICRC1, ICRC2, ICRC7
  - World Computer HTTP OUTCALLS
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

2. Change variable canister inside `config.mo` by replace it from above output
    ```
    public let INTERNET_IDENTITY_CANISTER = "rdmx6-jaaaa-aaaaa-aaadq-cai";
    public let NFT_CONTRACT_CANISTER = "umunu-kh777-77774-qaaca-cai";
    public let OPERATIONAL_CONTRACT_CANISTER = "ulvla-h7777-77774-qaacq-cai";
    public let TOKEN_CONTRACT_CANISTER = "vizcg-th777-77774-qaaea-cai";
    public let PREFERENCES_CONTRACT_CANISTER = "ufxgi-4p777-77774-qaadq-cai";
    public let FORUMS_CONTRACT_CANISTER = "u6s2n-gx777-77774-qaaba-cai";
    public let ICRC1_LEDGER_CANISTER = "uzt4z-lp777-77774-qaabq-cai";
    public let PICO_FRONTEND_CANISTER = "ucwa4-rx777-77774-qaada-cai";
    public let AI_CONTRACT_CANISTER = "uxrrr-q7777-77774-qaaaq-cai";
    ```
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
    ```
    minting_account = record { owner = principal \"{OPERATIONAL_CONTRACT_CANISTER_ID}\" }
    ```
- Change initial balances & controller ID by principal that you want.
    ```
    initial_balances = vec { record { record { owner = principal \"{YOUR_INIT_BALANCE_PRINCIPAL_ID}" }; 100_000_000_000_000 } }; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; controller_id = principal \"{YOUR_PRINCIPAL_CONTROLLER_ID}"
    ```
4. Install node modules first:
```npm install```
4.  Deploy it by running this:
```dfx deploy```
5. You will get canister UI Backend & Frontend <br/>
  `Example:`
    ```
    Deployed canisters.
    URLs:
      Frontend canister via browser:
        pico_frontend:
          - http://ucwa4-rx777-77774-qaada-cai.localhost:4943/ (Recommended)
          - http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai (Legacy)
      Backend canister via Candid interface:
        ai_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=uxrrr-q7777-77774-qaaaq-cai
        forums_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=u6s2n-gx777-77774-qaaba-cai
        icrc1_ledger_canister: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=uzt4z-lp777-77774-qaabq-cai
        internet_identity: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=rdmx6-jaaaa-aaaaa-aaadq-cai
        nft_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=umunu-kh777-77774-qaaca-cai
        operational_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=ulvla-h7777-77774-qaacq-cai
        preferences_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=ufxgi-4p777-77774-qaadq-cai
        token_contract: http://127.0.0.1:4943/?canisterId=vpyes-67777-77774-qaaeq-cai&id=vizcg-th777-77774-qaaea-cai
    ```
- You can open the backend canister to try the functions.
- You can open frontend from here as well.

6. If you want `hot reload` frontend development, you can run this on terminal
    ```
    npm run start
    ```
7. Open localhost that show up in terminal, example: `localhost:3000`
    ```
    4:30:43 AM [vite] (client) Re-optimizing dependencies because lockfile has changed

      VITE v6.3.5  ready in 676 ms

      ➜  Local:   http://localhost:3000/
      ➜  Network: use --host to expose
      ➜  press h + enter to show help
    ```

# Requirements to Run applications
- Node JS > 18.0
- ICP

# Deployed Canisters
Deployed mainnet canisters.

URLs:

  Frontend canister via browser:
  
  - pico_frontend: https://eueyk-uiaaa-aaaap-qp4la-cai.icp0.io/

  Backend canister via Candid interface:

  - ai_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=ebdjh-vaaaa-aaaap-qp4iq-cai
  - forums_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=eiac3-diaaa-aaaap-qp4ja-cai
  - icrc1_ledger_canister: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=epbep-oqaaa-aaaap-qp4jq-cai
  - nft_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=e2gvc-pyaaa-aaaap-qp4ka-cai
  - operational_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=e5htw-caaaa-aaaap-qp4kq-cai
  - preferences_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=etf66-zqaaa-aaaap-qp4lq-cai
  - token_contract: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=f6l2q-wyaaa-aaaap-qp4ma-cai

# Team Participants
1. Fajar Muhammad Hamka
    - Github: https://github.com/fajartd02
2. Natasya Felicia Malonda
    - Github: https://github.com/tasyafelcia
3. Pelangi Savana Puspa Romadoni
    - Github: https://github.com/pelangiromadoni
4. Stanislaus Kanaya Jerry Febriano
    - Github: https://github.com/yoshikazuuu
5. Reynaldo Marchell Bagas Adji
    - Github: https://github.com/reynaldomarchell