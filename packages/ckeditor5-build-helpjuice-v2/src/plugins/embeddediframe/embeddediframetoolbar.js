import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';
import { isEmbeddedIFrameWidget } from './utils';

function getClosestSelectedEmbeddedIFrameWidget(selection) {
	const viewElement = selection.getSelectedElement();

	if (viewElement && isEmbeddedIFrameWidget(viewElement)) {
		return viewElement;
	}

	let parent = selection.getFirstPosition().parent;

	while (parent) {
		if (parent.is('element') && isEmbeddedIFrameWidget(parent)) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

export default class EmbeddedIFrameToolbar extends Plugin {
	static get requires() {
		return [WidgetToolbarRepository];
	}

	afterInit() {
		const editor = this.editor;
		const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);

		widgetToolbarRepository.register('embeddedIFrame', {
			items: ['resizeEmbeddedIFrame'],
			getRelatedElement: selection => getClosestSelectedEmbeddedIFrameWidget(selection)
		});
	}
}
