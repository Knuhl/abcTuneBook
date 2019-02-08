export class Tune {
    title: string;
    abc: string;

    isTunebookTune = false;
    constructor(title: string, abc: string) {
        this.title = title;
        this.abc = abc;
    }
}
