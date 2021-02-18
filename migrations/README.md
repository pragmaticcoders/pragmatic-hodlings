# Mainnet deploy process using Infura node

1. Clone repo.

2. `npm i`

3. Export private key to env variables as PRIVATE_KEY or temporary paste into truffle-config.js. Be careful and not commit private key. 

4. Set host, gasLimit and gasPrice in truffle-config.ts.

5. `npm run compile`

6. Create csv file with initial hodlers. Row 0 for labels. Column 0 for address, column 1 for join date in format YYYY-MM-DD.

7. `npm run migrate:parseInitialCSV -- --csv=$PATH` where $PATH is csv path. 

e.g. `npm run migrate:parseInitialCSV -- --csv ./migrations/initialHodlingsExample.csv`

8. If output is correct, paste into `migrations/3_add_initial_hodlers.ts#initialHodlers`. We dont want to use I/O in migrations.

9. Configure multisig options in `migrations/4_transfer_ownership.ts`

10. `npm run migrate:mainnet`

11. Commit builds with addresses.
