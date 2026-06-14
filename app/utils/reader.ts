export function newFileReaderWrapper() {
    class FileReaderWrapper extends FileReader {
        constructor() {
            super();
        }

        async readString(file: File): Promise<[string, MaybeError]> {
            return new Promise<[string, MaybeError]>((resolve) => {
                this.onload = ({ target }) => {
                    const output = String(target?.result);
                    resolve([output, null]);
                };

                this.onerror = (error: any) => {
                    resolve(["", new Error(error?.message || error)]);
                };

                this.readAsText(file);
            });
        }
    }

    const fileReaderWrapper = new FileReaderWrapper();
    return fileReaderWrapper;
}
