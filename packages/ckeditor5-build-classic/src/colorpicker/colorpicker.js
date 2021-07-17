import ColorPickerEditing from './colorpickeredit';
import ColorPickerUI from './colorpickerui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class ColorPicker extends Plugin {
	/**
	 * @inheritDoc
	 */
	 static get pluginName() {
		return 'ColorPicker';
	}

	static get requires() {
		return [ColorPickerEditing, ColorPickerUI];
	}
}

