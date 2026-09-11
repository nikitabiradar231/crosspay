#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RequestStatus {
    Pending,
    Paid,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRequest {
    pub id: u64,
    pub student: Address,
    pub sponsor: Address,
    pub amount_xlm: u64,
    pub purpose: String,
    pub message: String,
    pub status: RequestStatus,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    RequestCount,
    Request(u64),
    UserRequests(Address),
}

#[contract]
pub struct StudentPaymentContract;

#[contractimpl]
impl StudentPaymentContract {
    /// Creates a new cross-border student payment request.
    pub fn create_request(
        env: Env,
        student: Address,
        sponsor: Address,
        amount_xlm: u64,
        purpose: String,
        message: String,
    ) -> u64 {
        student.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::RequestCount).unwrap_or(0);
        count += 1;

        let request = PaymentRequest {
            id: count,
            student: student.clone(),
            sponsor: sponsor.clone(),
            amount_xlm,
            purpose,
            message,
            status: RequestStatus::Pending,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Request(count), &request);
        env.storage().instance().set(&DataKey::RequestCount, &count);

        // Store request ID in student's request list
        let student_key = DataKey::UserRequests(student.clone());
        let mut student_reqs: Vec<u64> = env.storage().instance().get(&student_key).unwrap_or(Vec::new(&env));
        student_reqs.push_back(count);
        env.storage().instance().set(&student_key, &student_reqs);

        // Store request ID in sponsor's request list
        let sponsor_key = DataKey::UserRequests(sponsor.clone());
        let mut sponsor_reqs: Vec<u64> = env.storage().instance().get(&sponsor_key).unwrap_or(Vec::new(&env));
        sponsor_reqs.push_back(count);
        env.storage().instance().set(&sponsor_key, &sponsor_reqs);

        // Publish event
        env.events().publish(
            (symbol_short!("created"), student, sponsor),
            count,
        );

        count
    }

    /// Marks a payment request as Paid by the sponsor.
    pub fn pay_request(env: Env, sponsor: Address, request_id: u64) -> bool {
        sponsor.require_auth();

        let req_key = DataKey::Request(request_id);
        let mut request: PaymentRequest = match env.storage().instance().get(&req_key) {
            Some(r) => r,
            None => panic!("Payment request not found"),
        };

        if request.sponsor != sponsor {
            panic!("Unauthorized sponsor for this request");
        }

        if request.status != RequestStatus::Pending {
            panic!("Request is already processed");
        }

        request.status = RequestStatus::Paid;
        env.storage().instance().set(&req_key, &request);

        env.events().publish(
            (symbol_short!("paid"), sponsor, request.student),
            request_id,
        );

        true
    }

    /// Retrieves details of a specific payment request.
    pub fn get_request(env: Env, request_id: u64) -> PaymentRequest {
        env.storage()
            .instance()
            .get(&DataKey::Request(request_id))
            .expect("Request not found")
    }

    /// Gets total request count.
    pub fn get_request_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::RequestCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_create_and_pay_request() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, StudentPaymentContract);
        let client = StudentPaymentContractClient::new(&env, &contract_id);

        let student = Address::generate(&env);
        let sponsor = Address::generate(&env);

        let req_id = client.create_request(
            &student,
            &sponsor,
            &500,
            &String::from_str(&env, "Tuition"),
            &String::from_str(&env, "Fall Semester Tuition"),
        );

        assert_eq!(req_id, 1);
        assert_eq!(client.get_request_count(), 1);

        let req = client.get_request(&req_id);
        assert_eq!(req.amount_xlm, 500);
        assert_eq!(req.status, RequestStatus::Pending);

        let paid = client.pay_request(&sponsor, &req_id);
        assert!(paid);

        let req_after = client.get_request(&req_id);
        assert_eq!(req_after.status, RequestStatus::Paid);
    }
}
