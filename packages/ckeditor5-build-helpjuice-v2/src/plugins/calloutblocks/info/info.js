import InfoEditing from './infoediting';
import InfoUI from './infoui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class Info extends Plugin {
	static get requires() {
		return [InfoEditing, InfoUI];
	}
}
