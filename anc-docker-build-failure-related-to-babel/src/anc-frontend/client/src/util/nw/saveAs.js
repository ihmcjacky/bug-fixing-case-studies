/**
 * save as function for nwjs app.
 *
 * @param {Blob | string} blob Blob or data url / http url
 * @param {string} filename The default filename
 * @param {string} fileExtension The file extension, autofill when user changed the filename without extension. default would be the blob type
 * @param {function} onProgress callback when request receives more data. Call with completed percentage
 * @returns {Promise} The result object with success, error state and error msg
 */
export default function saveAs(blob, filename, fileExtension, onProgress = () => {}) {
    return new Promise((resolve) => {
        const inputOnChangeHandler = async () => {
            let localPath = inputNode.value;
            if (localPath === '') {
                console.log('--- nw save as error, user cancelled ---');
                return resolve({
                    success: false,
                    state: 'selectPath',
                    error: 'cancelled',
                });
            }

            const writeFile = async (blob) => {
                const fs = window.nw.require('fs');
                const extension = fileExtension || `.${blob.type.split('/').pop()}`;
                console.log(localPath);
                if (!localPath.endsWith(extension)) {
                    localPath += extension;
                }

                const buffer = Buffer.from(await blob.arrayBuffer());
                fs.writeFile(localPath, buffer, 'binary', (err) => {
                    if (!err) {
                        return resolve({success: true});
                    } else {
                        console.log('--- nw save as error, writeFile error ---', err);
                        return resolve({
                            success: false,
                            state: 'writeFile',
                            error: err,
                        });
                    }
                });
            }

            if (typeof blob !== 'string') {
                return writeFile(blob);
            } else {
                const xhrOnLoadendHandler = async () => {
                    if (xhr.status > 200) {
                        console.log('--- nw save as error, download file error ---', xhr.status);
                        return resolve({
                            success: false,
                            state: 'downlaod',
                            error: `http error: ${xhr.status}`,
                        });
                    }
                    return writeFile(xhr.response);
                };

                const xhrOnProgressHandler = (progress) => {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        onProgress(percentComplete);
                    }
                };

                const xhrOnErrorHandler = (err) => {
                    console.log('--- nw save as error, download file error ---', err);
                    return resolve({
                        success: false,
                        state: 'download',
                        error: err,
                    });
                };

                const xhr = new XMLHttpRequest();
                xhr.addEventListener('loadend', xhrOnLoadendHandler);
                xhr.addEventListener('progress', xhrOnProgressHandler);
                xhr.addEventListener('error', xhrOnErrorHandler);

                xhr.open('GET', blob);
                xhr.responseType = 'blob';
                xhr.send();
            }
        };

        const inputNode = document.createElement('input');
        inputNode.type = 'file';
        inputNode.accept = fileExtension || (blob?.type ?? `.${filename.split('.').pop()}`);
        inputNode.nwsaveas = true; // nwjs input attribute for open save as dialog
        // append a empty file, for detect user cancel save as dialog
        inputNode.files.append(new File(filename, ''));
        inputNode.addEventListener('change', inputOnChangeHandler);

        inputNode.dispatchEvent(new MouseEvent('click'));
    });
}
