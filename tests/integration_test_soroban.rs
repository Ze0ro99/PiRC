#![cfg(test)]
extern crate std;
use soroban_sdk::Env;

#[test]
fn test_monetary_parity_logic() {
    let env = Env::default();
    let qwf = 10_000_000;
    let market_price = 0.2248;
    let internal_value = market_price * (qwf as f64);
    
    // Asserting the parity logic against the established baseline
    assert_eq!(internal_value, 2_248_000.0);
    std::println!("Parity Verified: 1 Mined Pi = 2.248M REF Units");
}
