#![no_std]

// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.4.1

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_contract_utils::pausable::{self as pausable, Pausable};
use stellar_macros::{default_impl, only_owner, when_not_paused};
use stellar_tokens::non_fungible::{
    burnable::NonFungibleBurnable,
    enumerable::{Enumerable, NonFungibleEnumerable},
    Base, NonFungibleToken,
};

#[contract]
pub struct ProofOfDonation;

#[contracttype]
pub enum DataKey {
    TokenUri(u32),
}

#[contractimpl]
impl ProofOfDonation {
    pub fn __constructor(e: &Env, owner: Address) {
        let uri = String::from_str(e, "https://pod.example/api/pod-poap/metadata");
        let name = String::from_str(e, "ProofOfDonation");
        let symbol = String::from_str(e, "POD");

        Base::set_metadata(e, uri, name, symbol);
        ownable::set_owner(e, &owner);
    }

    #[only_owner]
    #[when_not_paused]
    pub fn mint(e: &Env, to: Address, caller: Address) {
        let _ = caller; // handled by macro
        Enumerable::sequential_mint(e, &to);
    }

    #[only_owner]
    pub fn set_token_uri(e: &Env, token_id: u32, uri: String, caller: Address) {
        let _ = caller; // handled by macro
        e.storage()
            .persistent()
            .set(&DataKey::TokenUri(token_id), &uri);
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for ProofOfDonation {
    type ContractType = Enumerable;

    #[when_not_paused]
    fn transfer(e: &Env, from: Address, to: Address, token_id: u32) {
        Self::ContractType::transfer(e, &from, &to, token_id);
    }

    #[when_not_paused]
    fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, token_id: u32) {
        Self::ContractType::transfer_from(e, &spender, &from, &to, token_id);
    }

    fn token_uri(e: &Env, token_id: u32) -> String {
        if let Some(uri) = e
            .storage()
            .persistent()
            .get::<_, String>(&DataKey::TokenUri(token_id))
        {
            uri
        } else {
            Self::ContractType::token_uri(e, token_id)
        }
    }
}

#[contractimpl]
impl Pausable for ProofOfDonation {
    fn paused(e: &Env) -> bool {
        pausable::paused(e)
    }

    #[only_owner]
    fn pause(e: &Env, caller: Address) {
        let _ = caller; // handled by macro
        pausable::pause(e);
    }

    #[only_owner]
    fn unpause(e: &Env, caller: Address) {
        let _ = caller; // handled by macro
        pausable::unpause(e);
    }
}

#[default_impl]
#[contractimpl]
impl Ownable for ProofOfDonation {}

#[contractimpl]
impl NonFungibleBurnable for ProofOfDonation {
    #[when_not_paused]
    fn burn(e: &Env, from: Address, token_id: u32) {
        Self::ContractType::burn(e, &from, token_id);
    }

    #[when_not_paused]
    fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32) {
        Self::ContractType::burn_from(e, &spender, &from, token_id);
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleEnumerable for ProofOfDonation {}


