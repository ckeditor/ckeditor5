import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ExtraFormattingUI from './extraformattingui';

export default class ExtraFormatting extends Plugin {
	static get requires() {
		return [ExtraFormattingUI];
	}

	static get pluginName() {
		return 'ExtraFormatting';
	}
}
