import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LayerGroup from './icons/layer-group.svg';

export default class AccordionUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('accordion', locale => {
			const command = editor.commands.get('insertAccordion');
			const buttonView = new ButtonView(locale);

			buttonView.set({
				label: t('Insert Accordion'),
				icon: LayerGroup,
				tooltip: true,
				class: "insert-accordion-btn"
			});

			buttonView.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

			this.listenTo(buttonView, 'execute', () => editor.execute('insertAccordion'));

			return buttonView;
		});
	}
}
