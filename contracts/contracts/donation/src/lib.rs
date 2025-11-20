#![no_std]

// SPDX-License-Identifier: MIT

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contract]
pub struct Donation;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DonationRecord {
    pub donor: Address,
    pub recipient: Address,
    pub amount: i128,
    pub asset: Address,
    pub timestamp: u64,
    pub memo: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    DonationCount,
    Donation(u64),
    TotalDonated(Address), // recipient -> total amount
}

#[contractimpl]
impl Donation {
    /// Initialize the donation contract
    pub fn initialize(e: &Env) {
        e.storage()
            .persistent()
            .set(&DataKey::DonationCount, &0u64);
    }

    /// Make a donation by transferring USDC (or any asset) from donor to recipient
    /// This function creates a payment operation that the caller must include in their transaction
    /// Returns the donation ID
    pub fn donate(
        e: &Env,
        donor: Address,
        recipient: Address,
        amount: i128,
        asset: Address,
        memo: Option<String>,
    ) -> u64 {
        donor.require_auth();

        // Get current donation count
        let count: u64 = e
            .storage()
            .persistent()
            .get(&DataKey::DonationCount)
            .unwrap_or(0u64);

        // Create donation record
        let donation = DonationRecord {
            donor: donor.clone(),
            recipient: recipient.clone(),
            amount,
            asset: asset.clone(),
            timestamp: e.ledger().timestamp(),
            memo: memo.clone(),
        };

        // Store donation record
        e.storage()
            .persistent()
            .set(&DataKey::Donation(count), &donation);

        // Update donation count
        let new_count = count + 1;
        e.storage()
            .persistent()
            .set(&DataKey::DonationCount, &new_count);

        // Update total donated for recipient
        let current_total: i128 = e
            .storage()
            .persistent()
            .get(&DataKey::TotalDonated(recipient.clone()))
            .unwrap_or(0i128);
        e.storage()
            .persistent()
            .set(&DataKey::TotalDonated(recipient), &(current_total + amount));

        new_count - 1 // Return the donation ID (0-indexed)
    }

    /// Get donation count
    pub fn donation_count(e: &Env) -> u64 {
        e.storage()
            .persistent()
            .get(&DataKey::DonationCount)
            .unwrap_or(0u64)
    }

    /// Get a specific donation by ID
    pub fn get_donation(e: &Env, donation_id: u64) -> Option<DonationRecord> {
        e.storage()
            .persistent()
            .get(&DataKey::Donation(donation_id))
    }

    /// Get total amount donated to a specific recipient
    pub fn total_donated(e: &Env, recipient: Address) -> i128 {
        e.storage()
            .persistent()
            .get(&DataKey::TotalDonated(recipient))
            .unwrap_or(0i128)
    }

    /// Get all donations for a specific donor
    pub fn get_donor_donations(e: &Env, donor: Address, limit: u32) -> Vec<DonationRecord> {
        let count = Self::donation_count(e);
        let mut result = Vec::new(e);
        let mut found = 0u32;

        // Iterate backwards to get most recent donations first
        let mut i = count;
        while i > 0 && found < limit {
            i -= 1;
            if let Some(donation) = Self::get_donation(e, i) {
                if donation.donor == donor {
                    result.push_back(donation);
                    found += 1;
                }
            }
        }

        result
    }

    /// Get all donations for a specific recipient
    pub fn get_recipient_donations(e: &Env, recipient: Address, limit: u32) -> Vec<DonationRecord> {
        let count = Self::donation_count(e);
        let mut result = Vec::new(e);
        let mut found = 0u32;

        // Iterate backwards to get most recent donations first
        let mut i = count;
        while i > 0 && found < limit {
            i -= 1;
            if let Some(donation) = Self::get_donation(e, i) {
                if donation.recipient == recipient {
                    result.push_back(donation);
                    found += 1;
                }
            }
        }

        result
    }
}

#[cfg(test)]
mod test;

