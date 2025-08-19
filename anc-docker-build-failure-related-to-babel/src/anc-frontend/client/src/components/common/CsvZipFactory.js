import JSZip from 'jszip';
// import {saveAs} from 'file-saver';
import saveAs from '../../util/nw/saveAs';

// const get = (o, p) =>
//     p.reduce(
//         (xs, x) =>
//             ((xs && xs[x]) ?
//                 xs[x] : null), o);

class CsvZipFactory {
    constructor(
        {
            seperator = ',',
        } =
        {
            seperator: ',',
        }
    ) {
        this.seperator = seperator;
        this.templateArray = [];
        this.csvArray = [];
        this.zipArray = [];
    }

    addTemplate(templateName, template) {
        const error = {status: false, msg: ''};
        try {
            this.templateArray = [...this.templateArray, {templateName, template}];
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.msg;
            return error;
        }
    }

    createLine(array) {
        return `${array.join(this.seperator)}\n`;
    }

    createCsv(csvName, templateName, source) {
        const error = {status: false, msg: ''};
        try {
            const selectedTemplate = this.templateArray.find(template => template.templateName === templateName);
            if (selectedTemplate === undefined) {
                throw new Error('Template cannot beFound');
            }
            const csv = selectedTemplate.template(source);
            this.csvArray = [...this.csvArray, {csvName, csv}];
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }

    createZip(zipName) {
        const error = {status: false, msg: ''};
        try {
            const zip = new JSZip();
            this.zipArray = [...this.zipArray, {zipName, zip, csvList: []}];
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }

    addCsvToZip(zipName, csvName) {
        const error = {status: false, msg: ''};
        try {
            const selectedZipIndex = this.zipArray.findIndex(zip => zip.zipName === zipName);
            if (selectedZipIndex === -1) {
                throw new Error('Zip cannot beFound');
            }
            const selectedCsv = this.csvArray.find(csv => csv.csvName === csvName);
            if (selectedCsv === undefined) {
                throw new Error('Csv cannot beFound');
            }
            this.zipArray[selectedZipIndex].csvList.push(selectedCsv);
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }

    exportZip(zipName, callback) {
        const error = {status: false, msg: ''};
        try {
            const selectedZip = this.zipArray.find(zip => zip.zipName === zipName);
            if (selectedZip === undefined) {
                throw new Error('Zip cannot beFound');
            }
            selectedZip.csvList.forEach((csvObj) => {
                selectedZip.zip.file(csvObj.csvName, csvObj.csv);
            });

            selectedZip.zip.generateAsync({type: 'blob'}).then((base64) => {
                saveAs(base64, selectedZip.zipName).then((res) => {
                    if (res.success && callback) {
                        callback();
                    }
                });
            },
            (err) => {
                error.status = true;
                error.msg = err.message;
                return error;
            });
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }

    listItem(key) {
        const error = {status: false, msg: ''};
        try {
            switch (key) {
                case 'zip':
                    return this.zipArray.map(zip => zip.zipName);
                case 'csv':
                    return this.csvArray.map(csv => csv.csvName);
                default:
                    throw new Error('Wrong key provided');
            }
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }

    deleteItem(key, name) {
        const error = {status: false, msg: ''};
        let idx = '';
        try {
            switch (key) {
                case 'zip':
                    idx = this.zipArray.findIndex(zip => zip.zipName === name);
                    if (idx === -1) {
                        throw new Error('Zip cannot beFound');
                    }
                    this.zipArray.splice(idx, 1);
                    break;
                case 'csv':
                    idx = this.csvArray.findIndex(csv => csv.csvName === name);
                    if (idx === -1) {
                        throw new Error('CSV cannot beFound');
                    }
                    this.csvArray.splice(idx, 1);
                    break;
                default:
                    throw new Error('Wrong key provided');
            }
            return error;
        } catch (err) {
            error.status = true;
            error.msg = err.message;
            return error;
        }
    }
}

export default CsvZipFactory;
