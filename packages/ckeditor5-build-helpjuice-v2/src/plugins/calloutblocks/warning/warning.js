import WarningEditing from './warningediting';
import WarningUI from './warningui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class Warning extends Plugin {
	static get requires() {
		return [WarningEditing, WarningUI];
	}
}
