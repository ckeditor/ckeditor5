This test checks whether multi-root editor initializes correctly when DOM elements are passed in `.create()`.

1. Click "Init editor".
2. Expected:
* Toolbar should be added in the first container.
* Three editable areas should be added in the second container.
3. Click "Destroy editor".
4. Expected:
* Editor should be destroyed.
* Toolbar should be removed.
* Editable areas should not be editable -- should be simple `<div>`s.
* The `.ck-body` region should be removed.

