use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct MathSum {
    pub sum: u32,
}

entrypoint!(process_instruction);


fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();

    // Get the account to interact/transact with
    // NOTE In this case, it's an account that stores data with a MathSum data structure
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Account does not have the correct program id!");
        return Err(ProgramError::IncorrectProgramId);
    }

    msg!("Debug output:");
    msg!("Account ID: {}", account.key);
    msg!("Executable: {}", account.executable);
    msg!("Lamports: {:?}", account.lamports);
    msg!("Debug output complete.");
    
    // Program logic (e.g., do something with sum)
    msg!("Adding 1 to sum...");
    
    // NOTE The Borsh type comes with a prebuilt method try_from_slice.
    // This gets a String slice representation of the bytes that make up
    // our MathSum struct/schema. Meaning, it attempts to deserialize the
    // slice into a MathSum struct. 
    let mut math_sum = MathSum::try_from_slice(&account.data.borrow())?;
    // Next, we can work with the data!
    math_sum.sum += 1;
    // Finally, serialize it all back into Borsh type
    math_sum.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Current sum is now: {}", math_sum.sum);
    

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
