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
pub struct MathSquare {
    pub square: u32,
}

entrypoint!(process_instruction);


fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();

    // Get the account to interact/transact with
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Account does not have the correct program id!");
        return Err(ProgramError::IncorrectProgramId);
    }

    msg!("Debug output:");
    msg!("Account ID: {}", account.key);
    msg!("Executable: {}", account.executable);
    msg!("Lamports: {}", account.lamports);
    msg!("Debug output complete.");
    
    // Program logic (e.g., do something with square)
    msg!("Squaring current value...");
    
    // NOTE The Borsh type comes with a prebuilt method try_from_slice.
    // This gets a String slice representation of the bytes that make up
    // our MathSquare struct/schema. Meaning, it attempts to deserialize the
    // slice into a MathSquare struct. 
    let mut math_square = MathSquare::try_from_slice(&account.data.borrow())?;
    // Next, we can work with the data!
    // math_square.square = math_square.square * math_square.square
    math_square.square = u32::pow(math_square.square, 2);
    // Finally, serialize it all back into Borsh type
    math_square.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Current square is now: {}", math_square.square);

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
