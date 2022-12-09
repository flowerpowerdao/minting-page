export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const AccountBalanceArgs = IDL.Record({ 'account' : AccountIdentifier });
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Archive = IDL.Record({ 'canister_id' : IDL.Principal });
  const Archives = IDL.Record({ 'archives' : IDL.Vec(Archive) });
  const BlockIndex = IDL.Nat64;
  const GetBlocksArgs = IDL.Record({
    'start' : BlockIndex,
    'length' : IDL.Nat64,
  });
  const Memo = IDL.Nat64;
  const Operation = IDL.Variant({
    'Burn' : IDL.Record({ 'from' : AccountIdentifier, 'amount' : Tokens }),
    'Mint' : IDL.Record({ 'to' : AccountIdentifier, 'amount' : Tokens }),
    'Transfer' : IDL.Record({
      'to' : AccountIdentifier,
      'fee' : Tokens,
      'from' : AccountIdentifier,
      'amount' : Tokens,
    }),
  });
  const TimeStamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
  const Transaction = IDL.Record({
    'memo' : Memo,
    'operation' : IDL.Opt(Operation),
    'created_at_time' : TimeStamp,
  });
  const Block = IDL.Record({
    'transaction' : Transaction,
    'timestamp' : TimeStamp,
    'parent_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const BlockRange = IDL.Record({ 'blocks' : IDL.Vec(Block) });
  const QueryArchiveError = IDL.Variant({
    'BadFirstBlockIndex' : IDL.Record({
      'requested_index' : BlockIndex,
      'first_valid_index' : BlockIndex,
    }),
    'Other' : IDL.Record({
      'error_message' : IDL.Text,
      'error_code' : IDL.Nat64,
    }),
  });
  const QueryArchiveResult = IDL.Variant({
    'Ok' : BlockRange,
    'Err' : QueryArchiveError,
  });
  const QueryArchiveFn = IDL.Func(
      [GetBlocksArgs],
      [QueryArchiveResult],
      ['query'],
    );
  const QueryBlocksResponse = IDL.Record({
    'certificate' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'blocks' : IDL.Vec(Block),
    'chain_length' : IDL.Nat64,
    'first_block_index' : BlockIndex,
    'archived_blocks' : IDL.Vec(
      IDL.Record({
        'callback' : QueryArchiveFn,
        'start' : BlockIndex,
        'length' : IDL.Nat64,
      })
    ),
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const TransferArgs = IDL.Record({
    'to' : AccountIdentifier,
    'fee' : Tokens,
    'memo' : Memo,
    'from_subaccount' : IDL.Opt(SubAccount),
    'created_at_time' : IDL.Opt(TimeStamp),
    'amount' : Tokens,
  });
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const TransferResult = IDL.Variant({
    'Ok' : BlockIndex,
    'Err' : TransferError,
  });
  const TransferFeeArg = IDL.Record({});
  const TransferFee = IDL.Record({ 'transfer_fee' : Tokens });
  return IDL.Service({
    'account_balance' : IDL.Func([AccountBalanceArgs], [Tokens], ['query']),
    'archives' : IDL.Func([], [Archives], ['query']),
    'decimals' : IDL.Func(
        [],
        [IDL.Record({ 'decimals' : IDL.Nat32 })],
        ['query'],
      ),
    'name' : IDL.Func([], [IDL.Record({ 'name' : IDL.Text })], ['query']),
    'query_blocks' : IDL.Func(
        [GetBlocksArgs],
        [QueryBlocksResponse],
        ['query'],
      ),
    'symbol' : IDL.Func([], [IDL.Record({ 'symbol' : IDL.Text })], ['query']),
    'transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'transfer_fee' : IDL.Func([TransferFeeArg], [TransferFee], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
=======
export default ({ IDL }) => {
   const AccountIdentifier = IDL.Text;
   const Duration = IDL.Record({ 'secs' : IDL.Nat64, 'nanos' : IDL.Nat32 });
   const ArchiveOptions = IDL.Record({
     'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
     'node_max_memory_size_bytes' : IDL.Opt(IDL.Nat32),
     'controller_id' : IDL.Principal,
   });
   const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
   const LedgerCanisterInitPayload = IDL.Record({
     'send_whitelist' : IDL.Vec(IDL.Tuple(IDL.Principal)),
     'minting_account' : AccountIdentifier,
     'transaction_window' : IDL.Opt(Duration),
     'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
     'archive_options' : IDL.Opt(ArchiveOptions),
     'initial_values' : IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
   });
   const AccountBalanceArgs = IDL.Record({ 'account' : AccountIdentifier });
   const SubAccount = IDL.Vec(IDL.Nat8);
   const BlockHeight = IDL.Nat64;
   const NotifyCanisterArgs = IDL.Record({
     'to_subaccount' : IDL.Opt(SubAccount),
     'from_subaccount' : IDL.Opt(SubAccount),
     'to_canister' : IDL.Principal,
     'max_fee' : ICPTs,
     'block_height' : BlockHeight,
   });
   const Memo = IDL.Nat64;
   const TimeStamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
   const SendArgs = IDL.Record({
     'to' : AccountIdentifier,
     'fee' : ICPTs,
     'memo' : Memo,
     'from_subaccount' : IDL.Opt(SubAccount),
     'created_at_time' : IDL.Opt(TimeStamp),
     'amount' : ICPTs,
   });
   return IDL.Service({
     'account_balance_dfx' : IDL.Func([AccountBalanceArgs], [ICPTs], ['query']),
     'notify_dfx' : IDL.Func([NotifyCanisterArgs], [], []),
     'send_dfx' : IDL.Func([SendArgs], [BlockHeight], []),
   });
 };
 export const init = ({ IDL }) => {
   const AccountIdentifier = IDL.Text;
   const Duration = IDL.Record({ 'secs' : IDL.Nat64, 'nanos' : IDL.Nat32 });
   const ArchiveOptions = IDL.Record({
     'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
     'node_max_memory_size_bytes' : IDL.Opt(IDL.Nat32),
     'controller_id' : IDL.Principal,
   });
   const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
   const LedgerCanisterInitPayload = IDL.Record({
     'send_whitelist' : IDL.Vec(IDL.Tuple(IDL.Principal)),
     'minting_account' : AccountIdentifier,
     'transaction_window' : IDL.Opt(Duration),
     'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
     'archive_options' : IDL.Opt(ArchiveOptions),
     'initial_values' : IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
   });
   return [LedgerCanisterInitPayload];
 };