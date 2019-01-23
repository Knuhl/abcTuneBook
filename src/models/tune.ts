export class Tune {
    id: number;
    title: string;
    abc: string;
    constructor(id: number, abc: string) {
        this.id = id;
        const header = ABCJS.parseOnly(abc, { header_only: true });
        this.title = header.length > 0 && header[0].metaText.title ? header[0].metaText.title : '(no title)';
        this.abc = abc;
    }
}
