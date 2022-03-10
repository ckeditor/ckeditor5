import DangerEditing from './dangerediting';
import DangerUI from './dangerui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class Danger extends Plugin {
	static get requires() {
		return [DangerEditing, DangerUI];
	}
}
