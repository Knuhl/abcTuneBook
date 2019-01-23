import { Tune } from './tune';

export class Tunebook {
    id: number;
    title: string;
    tunes: Tune[];
    constructor(id: number, title: string, tunes: Tune[]) {
        this.id = id;
        this.title = title;
        this.tunes = tunes;
    }
}
