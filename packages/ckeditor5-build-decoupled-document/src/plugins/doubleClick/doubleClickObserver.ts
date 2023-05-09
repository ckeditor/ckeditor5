import DomEventObserver from '../../../../ckeditor5-engine/src/view/observer/domeventobserver';

export default class DoubleClickObserver extends DomEventObserver {
	constructor(view) {
		super(view);

		this.domEventType = 'dblclick';
	}

	onDomEvent(domEvent) {
		this.fire(domEvent.type, domEvent);
	}
}
