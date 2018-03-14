# Pragmatic Hodlings
> Pragmatic Hodlings contracts allows any organization to distribute it's
tokens to all members according to their seniority.

### Contracts
* `PragmaticHodlings` - main contract with business logic for token distribution
* `MembersBookLib` - library used by main contract for storing members data
* `TransferableToken` - token contract interface, compatible with Pragmatic Hodlings
* `TestToken` - token contract based on ERC20 interface, used in test

Check out this project's [Github Pages](https://pragmaticcoders.github.io/pragmatic-hodlings/)

### Ownership
It is highly recommended to use Multisig and/or DAO contracts as owner of Pragmatic
Hodlings contract. That approach will be more transparent and will make actions to be
less dependent on organization leaders.

To transfer ownership from deployer call `transferOwnership` function passing an address
of new owner.

## Use cases

### Add and remove a member

![#addHodler](https://pragmaticcoders.github.io/pragmatic-hodlings/images/addHodler.png)
![#removeHodler](https://pragmaticcoders.github.io/pragmatic-hodlings/images/removeHodler.png)

### Receive and Settle token

![#receiveAndSettleToken](https://pragmaticcoders.github.io/pragmatic-hodlings/images/transferAndSettleToken.png)

## Members

Owner of contract is allowed to add (no duplicates) and remove members. Each members is
described by it's ETH address and timestamp related to joining to organization time.
Member data are stored in array of `Member` structures.

```Solidity
struct Member {
    address account;
    uint32 joined;
}
```

## Token share calculation

When owner is calling `settleToken` function, then available token amount is shared between all members
existing in `MembersBook`. Member's share size is directly related to member's seniority, and is
calculated from the following formula:

![sharesFormula](https://pragmaticcoders.github.io/pragmatic-hodlings/images/shareFormula.gif)

where
![A](https://pragmaticcoders.github.io/pragmatic-hodlings/images/a.gif) is shared amount,
![S](https://pragmaticcoders.github.io/pragmatic-hodlings/images/s.gif) is member seniority,
![n](https://pragmaticcoders.github.io/pragmatic-hodlings/images/n.gif) is member index and
![m](https://pragmaticcoders.github.io/pragmatic-hodlings/images/m.gif) is member count

The chart presented below perfectly shows how token shares differ in time and how each member share
depends on it's seniority and total members count.

It is important to notice that all shares are approaching in time to
![aDivM](https://pragmaticcoders.github.io/pragmatic-hodlings/images/aDivM.gif),
but they will probably never get there. It is a fair enough way to distribute tokens because the
oldest member always get biggest share but also newer members have a chance to get significant share.

![tokenShares](https://pragmaticcoders.github.io/pragmatic-hodlings/images/tokenShares.png)

## Transfers gas usage

Token settlement gas usage depends on total member count and token transfer method implementation.
Gas usage was tested for ERC20 OpenZeppelin implementation. Testing accounts never owned tokens.
Average change of gas usage after add new member for 100 members was 33 000 gas.
Actual block gas limit is 8 milions. 

8 000 000 / 33 000 ~~ 242

With this calculation maximum of members in contract is about 242. 

If block gas limit were decreased or added more than available members, solution is:
- create newer version of contract (e.g. with request withdraw) 
- move all members to new contract
- add as a only member created contract, then do settlement on old contract.
It is a emergency scenario. 

Warning! Count of max members calculated as 242 depends on token transfer gas usage and current block gas limit.

## Contributing

When submitting a bugfix, write a test that exposes the bug and fails before applying
your fix. Submit the test alongside the fix. When submitting a new feature, add tests
that cover the feature.

Usage:
* `npm install` - install dependencies
* `npm run compile` - compile *.ts and *.sol files
* `npm test`- run tests
* `npm run format` - format TypeScript files
* `npm run lint` - run linter

## Credits
* Project has been initialized with [TypeScript-Truffle generator](https://github.com/pragmaticcoders/truffle-ts-generator)
* MembersBook library based on [SignHash](https://github.com/SignHash/signhash-contracts) project

***
Licence: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
