# scripts

## token shares
    token_shares.script.ts allows to simulate token share changes during time and hodlers changes.
    Script generates csv data file.
    Bash scripts run truffle script and generate plots form data.

### prerequisites
    - Installed gnuplot (e.g. sudo apt install gnuplot)
    - Network specified in truffle-config as a testrpc should be available.
    - Contracts should be deployed.

### genarate CSV data
    - npm run calculate_token_shares -- data "[100, 200, 300, 400]" dataToRemove "[[60, 2], [90, 1]]"
     data:
      - required.
      - JSON String contains array of numbers, each of one is senority of hodler in days at start of simulation.
     dataToRemove:
      - optional.
      - JSON String contains array of tuples of numbers.
        First element in tuple is removing day, second one is a hodler to remove index.
        Hodler to remove index is hodler index in data param.

     Example call simulates:
        - At start, 4 hodlers, each of them with seniority 100, 200, 300, 400 days
        - At day 60 hodler with index 2 is removed so state now is 160, 260, 460 days
        - At day 90 hodler with index 1 is removed so state now is 190, 490 days

### generate plots
#### scripts/outputs/plot_adding_hodlers.sh
    - Runs series of simulations for different, but very similar data sets.
    - Creates a set of plots that shows how token shares changes depend on adding new hodlers.
    - Output scripts/outputs/adding_hodlers/
#### scripts/outputs/plot_removing_hodlers.sh
    - Runs simulation for data and dataToRemove.
    - Creates a plot that shows how token shares changes when hodlers are removing.
    - Output scripts/outputs/removing_hodlers/