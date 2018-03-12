# Pragmatic Hodlings
> Pragmatic Hodlings contracts allows any organization to distribute it's
tokens (ERC20) to all members according to their seniority.

### Contracts
* `PragmaticHodlings.sol` - main contract with business logic for token distribution
* `HodlersBookLib.sol` - library used by main contract for storing members data
* `TestToken.sol` - contract of Basic ERC20 token used in project tests

### Ownership
It is more than advisable to use Multisig and/or DAO contracts as owner of Pragmatic
Hodlings contract. That approach will be more transparent and will make actions to be
less dependent on organization leaders.

To transfer ownership from deployer call `transferOwnership` function passing an address
of new owner.

## Contributing

When submitting a bugfix, write a test that exposes the bug and fails before applying your fix. Submit the test alongside the fix.

When submitting a new feature, add tests that cover the feature.

Usage:
* `npm install` - install dependencies
* `npm run compile` - compile TS
* `npm test`- compile TS && run tests
* `npm run format` - format TypeScript files
* `npm run lint` - run linter

## Credits
* Project has been initialized with [Ts-Truffle generator](https://github.com/pragmaticcoders/truffle-ts-generator)
* HodlersBook library based on [SignHash](https://github.com/SignHash/signhash-contracts) project

***
Licence: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
