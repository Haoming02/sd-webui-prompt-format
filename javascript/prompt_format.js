class LeFormatter {

	static #cachedCardsInternal = null;
	static #aliasInternal = null;

	static forceReload() {
		this.#cachedCardsInternal = null;
		this.#aliasInternal = null;
	}

	/** @returns {string[]} */
	static get #cachedCards() {
		if (this.#cachedCardsInternal == null)
			this.#cachedCardsInternal = pfConfigs.cacheCards();

		return this.#cachedCardsInternal;
	}

	/** @returns {Map<RegExp, string>} */
	static get #alias() {
		if (this.#aliasInternal == null)
			this.#aliasInternal = pfConfigs.getTagAlias();

		return this.#aliasInternal;
	}

	/**
	 * @param {HTMLTextAreaElement} textArea
	 * @param {boolean} dedupe
	 * @param {boolean} removeUnderscore
	 * @param {boolean} autoRefresh
	 * @param {boolean} appendComma
	 */
	static formatPipeline(textArea, dedupe, removeUnderscore, autoRefresh, appendComma) {
		const lines = textArea.value.split('\n');

		for (let i = 0; i < lines.length; i++)
			lines[i] = this.#formatString(lines[i], dedupe, removeUnderscore);

		if (!appendComma)
			textArea.value = lines.join('\n');
		else {
			const val = lines.join(',\n');
			textArea.value = val.replace(/\n,\n/g, '\n\n');
		}

		if (autoRefresh)
			updateInput(textArea);
	}

	/** @param {string} input @param {boolean} dedupe @param {boolean} removeUnderscore @returns {string} */
	static #formatString(input, dedupe, removeUnderscore) {
		// Remove Duplicate
		input = dedupe ? this.#dedupe(input) : input;

		// Fix Commas inside Brackets
		input = input
			.replace(/,+\s*\)/g, '),')
			.replace(/,+\s*\]/g, '],')
			.replace(/\(\s*,+/g, ',(')
			.replace(/\[\s*,+/g, ',[');

		// Sentence -> Tags
		let tags = input.split(',');

		// Remove Underscore
		tags = removeUnderscore ? this.#removeUnderscore(tags) : tags;

		// Remove Stray Brackets
		const patterns = /^\(+$|^\)+$|^\[+$|^\]+$/;
		tags = tags.filter(word => !patterns.test(word));

		// Remove extra Spaces
		input = tags.join(', ').replace(/\s+/g, ' ');

		// Fix Bracket & Space
		input = input
			.replace(/\s\)/g, ')')
			.replace(/\s\]/g, ']')
			.replace(/\(\s/g, '(')
			.replace(/\[\s/g, '[');

		// Fix Empty Bracket
		while (input.match(/\(\s*\)|\[\s*\]/g))
			input = input.replace(/\(\s*\)|\[\s*\]/g, '');

		return input.split(',').map(word => word.trim()).filter(word => word).join(', ');
	}

	/** @param {string} input @returns {string} */
	static #dedupe(input) {
		const chunks = input.split(',');

		const KEYWORD = /^(AND|BREAK)$/;
		const uniqueSet = new Set();
		const resultArray = [];

		for (const tag of chunks) {
			const cleanedTag = tag.replace(/\[|\]|\(|\)/g, '').replace(/\s+/g, ' ').trim();

			if (KEYWORD.test(cleanedTag)) {
				resultArray.push(tag);
				continue;
			}

			let substitute = null;
			for (const [pattern, mainTag] of this.#alias) {
				if (substitute != null)
					continue;
				if (pattern.test(cleanedTag))
					substitute = mainTag;
			}

			if ((substitute == null) && (!uniqueSet.has(cleanedTag))) {
				uniqueSet.add(cleanedTag);
				resultArray.push(tag);
				continue;
			}

			if ((substitute != null) && (!uniqueSet.has(substitute))) {
				uniqueSet.add(substitute);
				resultArray.push(tag.replace(cleanedTag, substitute));
				continue;
			}

			resultArray.push(tag.replace(cleanedTag, ''));
		}

		return resultArray.join(', ');
	}

	/** @param {string[]} tags @returns {string[]} */
	static #removeUnderscore(tags) {
		const result = [];

		for (const tag of tags) {
			if (!tag.trim())
				continue;

			// [start:end:step] OR <lora:name:str>
			const chucks = tag.split(':').map(c => c.trim());

			for (let i = 0; i < chucks.length; i++) {
				if (!this.#cachedCards.includes(chucks[i]))
					chucks[i] = chucks[i].replaceAll('_', ' ');
			}

			result.push(chucks.join(':').trim());
		}

		return result;
	}
}

onUiLoaded(() => {

	const config = new pfConfigs();
	const formatter = pfUI.setupUIs(config.autoRun, config.dedupe, config.removeUnderscore);

	document.addEventListener('keydown', (e) => {
		if (e.altKey && e.shiftKey && e.code === 'KeyF') {
			e.preventDefault();
			for (const field of config.promptFields)
				LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, true, config.comma);
		}
	});

	formatter.auto.addEventListener("change", () => {
		config.autoRun = formatter.auto.checked;
		formatter.manual.style.display = config.autoRun ? 'none' : 'flex';
	});

	formatter.dedupe.addEventListener("change", () => {
		config.dedupe = formatter.dedupe.checked;
	});

	formatter.underscore.addEventListener("change", () => {
		config.removeUnderscore = formatter.underscore.checked;
		formatter.refresh.style.display = config.removeUnderscore ? 'flex' : 'none';
	});

	formatter.manual.addEventListener("click", () => {
		for (const field of config.promptFields)
			LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh, config.comma);
	});

	formatter.refresh.addEventListener("click", () => {
		LeFormatter.forceReload();
	});

	const tools = document.getElementById('quicksettings');
	tools.after(formatter);

	/** Expandable List of IDs in 1 place */
	const IDs = [
		'txt2img_generate',
		'txt2img_enqueue',
		'img2img_generate',
		'img2img_enqueue'
	];

	for (const id of IDs) {
		const button = document.getElementById(id);
		button?.addEventListener('click', () => {
			if (config.autoRun) {
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(field, config.dedupe, config.removeUnderscore, config.refresh, config.comma);
			}
		});
	}

});
