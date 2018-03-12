# Pragmatic Hodlings
> Pragmatic Hodlings contracts allows any organization to distribute it's
tokens (ERC20) to all members according to their seniority.

### Contracts
* `PragmaticHodlings.sol` - main contract with business logic for token distribution
* `HodlersBookLib.sol` - library used by main contract for storing members data
* `TestToken.sol` - contract of Basic ERC20 token used in project tests

### Ownership
It is highly recommended to use Multisig and/or DAO contracts as owner of Pragmatic
Hodlings contract. That approach will be more transparent and will make actions to be
less dependent on organization leaders.

To transfer ownership from deployer call `transferOwnership` function passing an address
of new owner.

## Use cases

### Add and remove a member

![#addHodler](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=T3duZXItPitQcmFnbWF0aWNcbkhvZGxpbmdzOiBhZGRIb2RsZXIKAAwTLS0-LQA5BTogAB8GQWRkZWQgZXZlbnQKCg&s=patent)
![#removeHodler](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=T3duZXItPitQcmFnbWF0aWNcbkhvZGxpbmdzOiByZW1vdmVIb2RsZXIKAA8TLS0-LQA8BTogAB8GUgAsBWQgZXZlbnQKCg&s=patent)

### Receive and settle ERC20 token

![#receiveAndSettleToken](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=RG9uYXRvci0tPkVSQzIwXG5Ub2tlbjogPDx0cmFuc2Zlcj4-Cgpub3RlIG92ZXIgACkHLE93bmVyOiBIaSEgSSd2ZSAAJghyZWQgc29tZVxudG9rZW5zIHRvIHlvdXIgb3JnYW5pemF0aW9uCgoAOgUtPitQcmFnbWF0aWNcbkhvZGxpbmdzOiA8PHNldHRsZQCBBgUAdglyaWdodCBvZiAAIRMKICAgIDw8Y2FsY3VsYXRlU2hhcmVzPj4KZW5kIG5vdGUKCgpsb29wIGZvciBlYWNoIG1lbWJlcgAzBQBxEy0-KwCBdBsgICAgAIIiDC0tPi0AgTQVVACCPgVmZXJlZCBldmVudAplbmQKCgoKAF8ULT4tAIJOBwCCfgVTAIF-BQAwCAoK&s=patent)

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
* HodlersBook library based on [SignHash](https://github.com/SignHash/signhash-contracts) project

***
Licence: [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
