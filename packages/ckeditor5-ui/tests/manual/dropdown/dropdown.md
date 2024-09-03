1. Make sure each dropdown opens when clicked.
2. The panel that shows up should be positioned precisely below and to the left edge of the parent dropdown.
4. The panel that shows up should float **over** the rest of the page.
5. Each dropdown should have **equal** width.

## ListDropdown

1. `ListDropdown` should close when any of the dropdown items is clicked. Clicked item's model should be logged in console.
2. `ListDropdown` should close when clicked beyond the dropdown like page body or other elements.

## Long label

1. Make sure that the label is truncated and followed by *"..."*.
2. Dropdown button "triangle" should be placed after *"..."*.
3. Text should not wrap to the next line.

### Notes:

* Play with `listDropdownModel.isOn` to control its "on/off" state.
* Play with `listDropdownModel.isEnabled` to control whether it's disabled.
* Play with `listDropdownModel.label` to control dropdown label.
* Play with `listDropdownCollection`, i.e. add new item:
```
listDropdownCollection.add(
	new window.Model( {
		label: '2.5em',
		style: 'font-size: 2.5em'
	} )
);
```

## Toolbar Dropdown
1. Play with `buttons[ n ].isOn` to control buttonDropdown active icon.
2. Play with `buttons[ n ].isEnabled` to control buttonDropdown disabled state (all buttons must be set to `false`).
3. Play with `toolbarDropdown.toolbarView.isVertical` to control buttonDropdown vertical/horizontal alignment.

## SplitButton Dropdown

* It should have two distinct fields: action button and arrow.
* Click on action button should be logged in console.
* Click on arrow button should open panel and should be logged in console.

## Menu Dropdown

* It should focus first item when dropdown button is pressed.
* It should have a "Top A" button and a few nested menus on the top level.
* It should close and log the button ID when a "leaf" button is pressed.
* It should have keyboard navigation (arrows, enter).
* Arrow left on top level should close the panel.
