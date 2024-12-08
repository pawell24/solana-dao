/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dao.json`.
 */
export type Dao = {
  address: "4bcdBwQkcDYPpa8hq3Xn4uv1BNLKJa6mwq3KwpKE5hvf";
  metadata: {
    name: "dao";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createProposal";
      discriminator: [132, 116, 68, 174, 216, 160, 198, 22];
      accounts: [
        {
          name: "proposal";
          writable: true;
          signer: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "tokenAccount";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        },
        {
          name: "options";
          type: {
            vec: "string";
          };
        },
        {
          name: "startTime";
          type: "i64";
        },
        {
          name: "endTime";
          type: "i64";
        }
      ];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "daoTokenMint";
          type: "pubkey";
        }
      ];
    },
    {
      name: "tallyVotes";
      discriminator: [144, 82, 0, 72, 160, 132, 35, 121];
      accounts: [
        {
          name: "proposal";
          writable: true;
        }
      ];
      args: [];
    },
    {
      name: "vote";
      discriminator: [227, 110, 155, 23, 136, 126, 172, 25];
      accounts: [
        {
          name: "proposal";
          writable: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "tokenAccount";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        }
      ];
      args: [
        {
          name: "optionIndex";
          type: "u8";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "daoConfig";
      discriminator: [55, 209, 87, 224, 30, 202, 192, 246];
    },
    {
      name: "proposal";
      discriminator: [26, 94, 189, 187, 116, 136, 53, 33];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "invalidTokenMint";
      msg: "Invalid DAO token mint.";
    },
    {
      code: 6001;
      name: "unauthorizedTokenAccount";
      msg: "Unauthorized token account.";
    },
    {
      code: 6002;
      name: "votingNotStarted";
      msg: "Voting has not started.";
    },
    {
      code: 6003;
      name: "votingEnded";
      msg: "Voting has already ended.";
    },
    {
      code: 6004;
      name: "invalidOption";
      msg: "Invalid voting option.";
    },
    {
      code: 6005;
      name: "votingNotEnded";
      msg: "Voting period has not ended.";
    },
    {
      code: 6006;
      name: "alreadyVoted";
      msg: "You have already voted.";
    }
  ];
  types: [
    {
      name: "daoConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "daoTokenMint";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "proposal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "title";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "options";
            type: {
              vec: "string";
            };
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "votes";
            type: {
              vec: "u64";
            };
          },
          {
            name: "voters";
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "winnerIndex";
            type: {
              option: "u8";
            };
          }
        ];
      };
    }
  ];
};

export const IDL = {
  address: "4bcdBwQkcDYPpa8hq3Xn4uv1BNLKJa6mwq3KwpKE5hvf",
  metadata: {
    name: "dao",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "create_proposal",
      discriminator: [132, 116, 68, 174, 216, 160, 198, 22],
      accounts: [
        {
          name: "proposal",
          writable: true,
          signer: true,
        },
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "token_account",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
      args: [
        {
          name: "title",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "options",
          type: {
            vec: "string",
          },
        },
        {
          name: "start_time",
          type: "i64",
        },
        {
          name: "end_time",
          type: "i64",
        },
      ],
    },
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "authority",
          writable: true,
          signer: true,
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "dao_token_mint",
          type: "pubkey",
        },
      ],
    },
    {
      name: "tally_votes",
      discriminator: [144, 82, 0, 72, 160, 132, 35, 121],
      accounts: [
        {
          name: "proposal",
          writable: true,
        },
      ],
      args: [],
    },
    {
      name: "vote",
      discriminator: [227, 110, 155, 23, 136, 126, 172, 25],
      accounts: [
        {
          name: "proposal",
          writable: true,
        },
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 97, 111, 45, 99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "token_account",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
      ],
      args: [
        {
          name: "option_index",
          type: "u8",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "DaoConfig",
      discriminator: [55, 209, 87, 224, 30, 202, 192, 246],
    },
    {
      name: "Proposal",
      discriminator: [26, 94, 189, 187, 116, 136, 53, 33],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidTokenMint",
      msg: "Invalid DAO token mint.",
    },
    {
      code: 6001,
      name: "UnauthorizedTokenAccount",
      msg: "Unauthorized token account.",
    },
    {
      code: 6002,
      name: "VotingNotStarted",
      msg: "Voting has not started.",
    },
    {
      code: 6003,
      name: "VotingEnded",
      msg: "Voting has already ended.",
    },
    {
      code: 6004,
      name: "InvalidOption",
      msg: "Invalid voting option.",
    },
    {
      code: 6005,
      name: "VotingNotEnded",
      msg: "Voting period has not ended.",
    },
    {
      code: 6006,
      name: "AlreadyVoted",
      msg: "You have already voted.",
    },
  ],
  types: [
    {
      name: "DaoConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "dao_token_mint",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "Proposal",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "pubkey",
          },
          {
            name: "title",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "options",
            type: {
              vec: "string",
            },
          },
          {
            name: "start_time",
            type: "i64",
          },
          {
            name: "end_time",
            type: "i64",
          },
          {
            name: "votes",
            type: {
              vec: "u64",
            },
          },
          {
            name: "voters",
            type: {
              vec: "pubkey",
            },
          },
          {
            name: "winner_index",
            type: {
              option: "u8",
            },
          },
        ],
      },
    },
  ],
};
