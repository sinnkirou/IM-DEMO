export interface IFile {
	fp: string;
	name: string;
	type: string;
	url: string;
}

export enum DataType {
	TEXT = 'TEXT',
	IMAGE = 'IMAGE',
	AUDIO = 'AUDIO',
	FILE = 'FILE'
}

export const setFileMsgContent = (fileName: string, type: DataType, fp: string, fileUrl: string) =>
	`${fp}|${fileName}|${type}|${fileUrl}`;

export const getFile = (dataContent: string): IFile => {
	const paramArray = dataContent.split('|');
	return {
		fp: paramArray[0] || '',
		name: paramArray[1] || '',
		type: paramArray[2] || DataType.TEXT,
		url: paramArray[3] || ''
	};
};

export const getLocalFileURL = (file) => {
	let getUrl = null;
	if (window.createObjectURL !== undefined) {
		// basic
		getUrl = window.createObjectURL(file);
	} else if (window.URL !== undefined) {
		// mozilla(firefox)
		getUrl = window.URL.createObjectURL(file);
	} else if (window.webkitURL !== undefined) {
		// webkit or chrome
		getUrl = window.webkitURL.createObjectURL(file);
	}
	return getUrl;
};
