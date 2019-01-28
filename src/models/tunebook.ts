import { Tune } from './tune';

export class Tunebook {
    id: number;
    title: string;
    tunes: Tune[];

    onlyLocal = false;
    abcLoaded = false;
    constructor(id: number, title: string, tunes: Tune[]) {
        this.id = id;
        this.title = title;
        this.tunes = tunes;
    }
}
