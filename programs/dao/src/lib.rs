use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

declare_id!("4bcdBwQkcDYPpa8hq3Xn4uv1BNLKJa6mwq3KwpKE5hvf");

#[program]
pub mod dao {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, dao_token_mint: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.dao_token_mint = dao_token_mint;
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        options: Vec<String>,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let token_account_data = TokenAccount::try_deserialize(
            &mut &ctx.accounts.token_account.try_borrow_data()?[..],
        )?;
        require!(
            token_account_data.owner == *ctx.accounts.user.key,
            CustomError::UnauthorizedTokenAccount
        );
        require!(
            token_account_data.mint == ctx.accounts.config.dao_token_mint,
            CustomError::InvalidTokenMint
        );
        proposal.creator = *ctx.accounts.user.key;
        proposal.title = title;
        proposal.description = description;
        proposal.options = options;
        proposal.start_time = start_time;
        proposal.end_time = end_time;
        proposal.votes = vec![0; proposal.options.len()];
        proposal.voters = vec![];
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time >= proposal.start_time, CustomError::VotingNotStarted);
        require!(current_time <= proposal.end_time, CustomError::VotingEnded);
        require!(
            (option_index as usize) < proposal.options.len(),
            CustomError::InvalidOption
        );
        require!(
            !proposal.voters.contains(ctx.accounts.user.key),
            CustomError::AlreadyVoted
        );
        let token_account_data = TokenAccount::try_deserialize(
            &mut &ctx.accounts.token_account.try_borrow_data()?[..],
        )?;
        require!(
            token_account_data.mint == ctx.accounts.config.dao_token_mint,
            CustomError::InvalidTokenMint
        );
        let user_votes = token_account_data.amount;
        proposal.votes[option_index as usize] += user_votes;
        proposal.voters.push(*ctx.accounts.user.key);
        Ok(())
    }

    pub fn tally_votes(ctx: Context<TallyVotes>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;
    
        require!(current_time > proposal.end_time, CustomError::VotingNotEnded);
    
        let mut max_votes = 0;
        let mut winner_index: Option<u8> = None;
    
        for (i, &votes) in proposal.votes.iter().enumerate() {
            if votes > max_votes {
                max_votes = votes;
                winner_index = Some(i as u8);
            }
        }
    
        if winner_index.is_none() {
            msg!("No votes were cast. Setting winner_index to None.");
            proposal.winner_index = None;
        } else {
            proposal.winner_index = winner_index;
            msg!(
                "Voting results tallied successfully. Winner index: {:?}",
                winner_index
            );
        }
    
        Ok(())
    }
    
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32,
        seeds = [b"dao-config".as_ref()],
        bump
    )]
    pub config: Account<'info, DaoConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = user, space = 8 + Proposal::LEN)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"dao-config".as_ref()],
        bump,
    )]
    pub config: Account<'info, DaoConfig>,
    #[account()]
    /// CHECK: Token account is verified in the program logic by deserializing it and checking its mint
    pub token_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"dao-config".as_ref()],
        bump,
    )]
    pub config: Account<'info, DaoConfig>,
    #[account()]
    /// CHECK: Token account is verified in the program logic by deserializing it and checking its mint
    pub token_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TallyVotes<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[account]
pub struct DaoConfig {
    pub dao_token_mint: Pubkey,
}

#[account]
pub struct Proposal {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub options: Vec<String>,
    pub start_time: i64,
    pub end_time: i64,
    pub votes: Vec<u64>,
    pub voters: Vec<Pubkey>,
    pub winner_index: Option<u8>,
}

impl Proposal {
    pub const LEN: usize = 32 + 256 + 256 + 8 + 8 + (4 + 8) * 10 + (32 * 100) + 1;
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid DAO token mint.")]
    InvalidTokenMint,
    #[msg("Unauthorized token account.")]
    UnauthorizedTokenAccount,
    #[msg("Voting has not started.")]
    VotingNotStarted,
    #[msg("Voting has already ended.")]
    VotingEnded,
    #[msg("Invalid voting option.")]
    InvalidOption,
    #[msg("Voting period has not ended.")]
    VotingNotEnded,
    #[msg("You have already voted.")]
    AlreadyVoted,
}
