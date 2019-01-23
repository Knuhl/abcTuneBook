declare module ABCJS {
    //tuneObjectArray = ABCJS.renderAbc(output, tunebookString, params)
    //Completely renders the tunebook.
    export function renderAbc(output: any, tunebookString: any, params: any): any;

    //tuneObjectArray = ABCJS.renderMidi(output, tunebookString, params)
    //Completely creates midi for the tunebook.
    export function renderMidi(output: any, tunebookString: any, params: any): any;

    //tuneObjectArray = ABCJS.parseOnly(tunebookString, params)
    //Parses all the tunes in the tunebookString and returns an array of them parsed structure.
    export function parseOnly(tunebookString: any, params: any): any;

    //integer = ABCJS.numberOfTunes(tunebookString)
    //Returns the number of tunes found in the tunebook.
    export function numberOfTunes(tunebookString: any): any;

    //tunebook = new ABCJS.TuneBook(tunebookString)
    //Returns a TuneBook object, describing the tunebook passed in.
    export function TuneBook(tunebookString: any): any;
}