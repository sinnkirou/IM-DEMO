export interface IFile {
	name: string;
	url: string;
}

export enum DataType {
	TEXT = 'TEXT',
	IMAGE = 'IMAGE',
	AUDIO = 'AUDIO',
	FILE = 'FILE'
}

export const getDataType = (fp: string, dataContent: string) => {
	if (dataContent.indexOf(setFileMsgContent('', DataType.IMAGE, fp, '')) > -1) {
		return DataType.IMAGE;
	} else if (dataContent.indexOf(setFileMsgContent('', DataType.FILE, fp, '')) > -1) {
		return DataType.FILE;
	} else if (dataContent.indexOf(setFileMsgContent('', DataType.AUDIO, fp, '')) > -1) {
		return DataType.AUDIO;
	}
	return DataType.TEXT;
};

export const setFileMsgContent = (fileName: string, type: DataType, fp: string, fileUrl: any) =>
	`${fileName}-${type}-${fp}:${fileUrl}`;

export const getFile = (type: DataType, fp: string, dataContent: string): IFile => {
	const pattern = `-${type}-${fp}:`;
	return {
		name: dataContent.substring(0, dataContent.indexOf(pattern)),
		url: dataContent.substring(dataContent.indexOf(pattern) + pattern.length)
	};
};

export const getFileURL = (file) => {
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
