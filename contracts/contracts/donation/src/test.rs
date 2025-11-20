#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let e = Env::default();
    let contract_id = e.register_contract(None, Donation);
    let client = DonationClient::new(&e, &contract_id);

    client.initialize();
    assert_eq!(client.donation_count(), 0);
}

#[test]
fn test_donate() {
    let e = Env::default();
    let contract_id = e.register_contract(None, Donation);
    let client = DonationClient::new(&e, &contract_id);

    client.initialize();

    let donor = Address::generate(&e);
    let recipient = Address::generate(&e);
    let asset = Address::generate(&e);
    let amount = 1000i128;

    // Note: In a real test, you'd need to set up proper authentication
    // This is a simplified test structure
    e.as_contract(&contract_id, || {
        let donation_id = client.donate(&donor, &recipient, &amount, &asset, &None);
        assert_eq!(donation_id, 0u64);
        assert_eq!(client.donation_count(), 1);
        assert_eq!(client.total_donated(&recipient), amount);
    });
}

