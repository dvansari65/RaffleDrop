/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/Raffle.json`.
 */
export type Raffle = {
  "address": "5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz",
  "metadata": {
    "name": "raffle",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTickets",
      "discriminator": [
        48,
        16,
        122,
        137,
        24,
        214,
        198,
        58
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyerTokenAccont",
          "writable": true
        },
        {
          "name": "raffleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle_account.seller",
                "account": "raffleAccount"
              },
              {
                "kind": "account",
                "path": "raffle_account.selling_price",
                "account": "raffleAccount"
              },
              {
                "kind": "account",
                "path": "raffle_account.deadline",
                "account": "raffleAccount"
              }
            ]
          }
        },
        {
          "name": "escrowPaymentAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raffleAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "numTickets",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createRaffle",
      "discriminator": [
        226,
        206,
        159,
        34,
        213,
        207,
        98,
        126
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "paymentMint",
          "docs": [
            "Payment token mint (USDC, SOL wrapped, etc.)"
          ]
        },
        {
          "name": "sellerTokenAccount",
          "docs": [
            "Seller's token account"
          ],
          "writable": true
        },
        {
          "name": "raffleAccount",
          "docs": [
            "Raffle PDA"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "arg",
                "path": "sellingPrice"
              },
              {
                "kind": "arg",
                "path": "deadline"
              }
            ]
          }
        },
        {
          "name": "escrowPaymentAccount",
          "docs": [
            "Escrow token account - THE FIX IS HERE",
            "Must be initialized AFTER raffle_account exists"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raffleAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Programs"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "itemName",
          "type": "string"
        },
        {
          "name": "itemDescription",
          "type": "string"
        },
        {
          "name": "itemImageUri",
          "type": "string"
        },
        {
          "name": "sellingPrice",
          "type": "u64"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "minTickets",
          "type": "u32"
        },
        {
          "name": "maxTickets",
          "type": "u32"
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "raffleAccount",
      "discriminator": [
        148,
        199,
        5,
        56,
        54,
        26,
        78,
        102
      ]
    }
  ],
  "events": [
    {
      "name": "raffleCreated",
      "discriminator": [
        178,
        172,
        201,
        96,
        233,
        171,
        6,
        99
      ]
    },
    {
      "name": "ticketsBought",
      "discriminator": [
        204,
        103,
        221,
        60,
        70,
        142,
        88,
        233
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6001,
      "name": "invalidTicketCount",
      "msg": "Invalid ticket count"
    },
    {
      "code": 6002,
      "name": "invalidDeadline",
      "msg": "Invalid deadline"
    },
    {
      "code": 6003,
      "name": "raffleNotActive",
      "msg": "Raffle not active"
    },
    {
      "code": 6004,
      "name": "deadlinePassed",
      "msg": "Deadline passed"
    },
    {
      "code": 6005,
      "name": "maxTicketsReached",
      "msg": "Max tickets reached"
    },
    {
      "code": 6006,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6007,
      "name": "cannotDrawYet",
      "msg": "Cannot draw yet"
    },
    {
      "code": 6008,
      "name": "minTicketsNotReached",
      "msg": "Min tickets not reached"
    },
    {
      "code": 6009,
      "name": "invalidStatus",
      "msg": "Invalid status"
    },
    {
      "code": 6010,
      "name": "noParticipants",
      "msg": "No participants"
    },
    {
      "code": 6011,
      "name": "raffleNotCompleted",
      "msg": "Raffle not completed"
    },
    {
      "code": 6012,
      "name": "notWinner",
      "msg": "Not winner"
    },
    {
      "code": 6013,
      "name": "alreadyClaimed",
      "msg": "Already claimed"
    },
    {
      "code": 6014,
      "name": "notSeller",
      "msg": "Not seller"
    },
    {
      "code": 6015,
      "name": "ticketsAlreadySold",
      "msg": "Tickets already sold"
    },
    {
      "code": 6016,
      "name": "deadlineNotReached",
      "msg": "Deadline not reached"
    },
    {
      "code": 6017,
      "name": "minTicketsReached",
      "msg": "Min tickets reached"
    }
  ],
  "types": [
    {
      "name": "raffleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "paymentMint",
            "type": "pubkey"
          },
          {
            "name": "itemName",
            "type": "string"
          },
          {
            "name": "itemDescription",
            "type": "string"
          },
          {
            "name": "itemImageUri",
            "type": "string"
          },
          {
            "name": "sellingPrice",
            "type": "u64"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "minTickets",
            "type": "u32"
          },
          {
            "name": "maxTickets",
            "type": "u32"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "participants",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "totalCollected",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "raffleStatus"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "escrowBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raffleCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "raffleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "drawing"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "refunded"
          }
        ]
      }
    },
    {
      "name": "ticketsBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "raffle",
            "type": "pubkey"
          },
          {
            "name": "numberOfTicketsBought",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
