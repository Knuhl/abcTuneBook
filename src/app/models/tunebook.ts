import { Tune } from './tune';

export class Tunebook {
    id: number;
    title: string;
    abc: string;

    tunes: Tune[];
    onlyLocal = false;
    abcLoaded = false;

    constructor(id: number, title: string, abc: string) {
        this.id = id;
        this.title = title;
        this.abc = abc;
    }
}
