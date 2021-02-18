import * as fs from 'fs';
import * as yargs from 'yargs';

interface InitialHodler {
    address: Address;
    joined: number;
}

const ADDRESS_COLUMN = 0;
const DATE_COLUMN = 1;
const ENCODING = 'utf-8';

const argv = yargs.option('csv', {require: true, type: 'string'}).argv;

(function run() {
    const initialHodlers = getInitialHodlers(argv.csv);
    // tslint:disable:no-console
    console.log(initialHodlers);
})();

function getInitialHodlers(path: string): InitialHodler[] {
    const result: InitialHodler[] = [];
    const lines = fs.readFileSync(path, ENCODING)
        .split('\n');

    lines.forEach((line, idx) => {
        if (idx === 0) {
            // address,date(YYYY-MM-DD)
            return;
        }
        const splitted = line.split(',');
        result.push({
            address: splitted[ADDRESS_COLUMN],
            joined: toTimestamp(splitted[DATE_COLUMN]),
        });

    });

    return result;
}

function toTimestamp(date: string) {
    return Math.floor(Date.parse(date) / 1000);
}
