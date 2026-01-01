import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils"
import { useMutation } from "@tanstack/react-query"

interface CreateRaffleInputs {
    itemName: string,
    itemDescription: string,
    itemImageUri: string,
    sellingPrice: number,
    ticketPrice: number,
    minTickets: number,
    maxTickets: number,
    deadline: number,
}
// pub struct CreateRaffle<'info> {
//     #[account(mut)]
//     pub seller: Signer<'info>,

//     /// Payment token mint (USDC, SOL wrapped, etc.)
//     pub payment_mint: Account<'info,token:: Mint>,

//     /// Seller's token account
//     #[account(
//         mut,
//         constraint = seller_token_account.mint == payment_mint.key(),
//         constraint = seller_token_account.owner == seller.key(),
//     )]
//     pub seller_token_account: Account<'info, token::TokenAccount>,

//     /// Raffle PDA
//     #[account(
//         init,
//         payer = seller,
//         space = 8 + RaffleAccount::INIT_SPACE,
//         seeds = [
//             b"raffle",
//             seller.key().as_ref(),
//             &selling_price.to_le_bytes(),
//             &deadline.to_le_bytes()
//         ],
//         bump
//     )]
//     pub raffle_account: Account<'info, RaffleAccount>,

//     /// Escrow token account - THE FIX IS HERE
//     /// Must be initialized AFTER raffle_account exists
//     #[account(
//         init,
//         payer = seller,
//         seeds = [b"escrow_payment", raffle_account.key().as_ref()],
//         bump,
//         token::mint = payment_mint,
//         token::authority = raffle_account,
//     )]
//     pub escrow_payment_account: Account<'info, token::TokenAccount>,

//     /// Programs
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     pub rent: Sysvar<'info, Rent>,
// }

export const CreateRaffle = () => {
    const {program} = useRaffleProgram()
    return useMutation<any,Error,CreateRaffleInputs>({
        mutationKey: ["create-raffle"],
        mutationFn: async ({
            itemName,
            itemDescription,
            itemImageUri,
            sellingPrice,
            ticketPrice,
            minTickets,
            maxTickets,
            deadline
        }:CreateRaffleInputs) => {
            try {
                const tx = program.methods
                .createRaffle(
                    itemName,
                    itemImageUri,
                    sellingPrice,
                    ticketPrice,
                    minTickets,
                    maxTickets,
                    deadline
                )
                .accounts({
                    seller:publicKey,
                    
                })
                .rpc()
            } catch (error) {

            }
        }
    })
}