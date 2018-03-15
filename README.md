# Pragmatic Hodlings
> Pragmatic Hodlings contracts allows any organization to distribute it's
tokens to all members according to their seniority.

### Contracts
* `PragmaticHodlings` - main contract with business logic for token distribution
* `MembersBookLib` - library used by main contract for storing members data
* `TransferableToken` - token contract interface, compatible with Pragmatic Hodlings
* `TestToken` - token contract based on ERC20 interface, used in test

Check out this project on [Github Pages](https://pragmaticcoders.github.io/pragmatic-hodlings/)

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

## Settlement gas costs and maximum members count

After running several tests of gas used by `settleToken` function we came up with some conclusions. Test were done for Zeppelin ERC20 token implementation, test accounts have never owned tokens, and members count on contract was increasing up to 100. 

First of all settlement gas cost increase each time we add new member by average 33 000 gas. 
Furthermore a block has a gas limit which is 8 000 000 for now.

If we do the math we get maximum members count for a contract which is 242.\
`8 000 000 / 33 000  ~ 242` 

*Warning!* \
In case of emergency when member count at contract exceed possible limit we should consider this solusions:
* Create newer version of contract  (e.g. with scenario when member pays for its transfer)
* Move all members to new contract

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
