import FilesManagerUI from './filesmanagerui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class FilesManager extends Plugin {
	static get requires() {
		return [FilesManagerUI];
	}
}
