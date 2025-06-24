// PICO Token Created by ICRC-1 Ledger

actor Token {
  // Reference to the ICRC-1 ledger canister
  let ledger = actor("uxrrr-q7777-77774-qaaaq-cai") : actor {
    icrc1_name : () -> async Text;
    icrc1_symbol : () -> async Text;
    icrc1_decimals : () -> async Nat8;
    icrc1_total_supply : () -> async Nat;
    icrc1_fee : () -> async Nat;
    icrc1_metadata : () -> async [(Text, Value)];
  };

  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : [Nat8];
  };

  public type TokenInfo = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Nat;
    fee : Nat;
  };

  public func get_token_info() : async TokenInfo {
    let name = await ledger.icrc1_name();
    let symbol = await ledger.icrc1_symbol();
    let decimals = await ledger.icrc1_decimals();
    let total_supply = await ledger.icrc1_total_supply();
    let fee = await ledger.icrc1_fee();

    {
      name = name;
      symbol = symbol;
      decimals = decimals;
      total_supply = total_supply;
      fee = fee;
    }
  };
}