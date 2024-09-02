class LeFormatterUI {

	/** @param {Function} onClick @returns {HTMLButtonElement} */
	static #button(onClick) {
		const button = document.createElement('button');
		button.textContent = 'Format';

		button.id = 'manual-format';
		button.classList.add(['lg', 'secondary', 'gradio-button']);

		button.addEventListener('click', onClick);
		return button;
	}

	/** @param {boolean} default_value @param {string} text @returns {HTMLDivElement} */
	static #checkbox(default_value, text) {
		const label = document.getElementById('tab_settings').querySelector('input[type=checkbox]').parentNode.cloneNode(true);
		label.removeAttribute('id');
		label.classList.add("pf-checkbox");

		const checkbox = label.children[0];
		checkbox.checked = default_value;

		const span = label.children[1];
		span.textContent = text;

		return label;
	}

	/**
	 * @param {Function} onManual
	 * @param {boolean} autoRun @param {boolean} dedupe @param {boolean} removeUnderscore
	 * @returns {HTMLDivElement}
	 * */
	static setupUIs(onManual, autoRun, dedupe, removeUnderscore) {
		const formatter = document.createElement('div');
		formatter.id = 'le-formatter';

		const manualBtn = this.#button(onManual);
		manualBtn.style.display = autoRun ? 'none' : 'flex';

		const autoCB = this.#checkbox(autoRun, 'Auto Format');
		const dedupeCB = this.#checkbox(dedupe, 'Remove Duplicates');
		const underscoreCB = this.#checkbox(removeUnderscore, 'Remove Underscores');

		formatter.appendChild(autoCB);
		formatter.appendChild(manualBtn);
		formatter.appendChild(dedupeCB);
		formatter.appendChild(underscoreCB);

		formatter.btn = manualBtn;
		formatter.checkboxs = [
			autoCB.children[0],
			dedupeCB.children[0],
			underscoreCB.children[0]
		];

		return formatter;
	}

}
