class LeFormatter {
	// #region Alias & Cards

	static #aliasData = null;
	static #cardsData = null;

	static forceReload() {
		this.#aliasData = null;
		this.#cardsData = null;
	}

	/** @returns {{RegExp: string}} */
	static get #alias() {
		return (this.#aliasData ??= pfConfigs.getTagAlias());
	}

	/** @returns {string[]} */
	static get #cards() {
		return (this.#cardsData ??= pfConfigs.cacheCards());
	}

	// #region Pipeline

	/**
	 * @param {HTMLTextAreaElement} textArea
	 * @param {boolean} dedupe
	 * @param {boolean} rmUnderscore
	 * @param {boolean} autoRefresh
	 * @param {boolean} appendComma
	 */
	static formatPipeline(textArea, dedupe, rmUnderscore, autoRefresh, appendComma) {
		const lines = textArea.value.split("\n");

		for (let i = 0; i < lines.length; i++)
			lines[i] = this.formatString(lines[i], dedupe, rmUnderscore);

		if (!appendComma) textArea.value = lines.join("\n");
		else {
			const val = lines.join(",\n");
			textArea.value = val
				.replace(/\n,\n/g, "\n\n") // Empty Line
				.replace(/[,\s]*$/g, "") // Last Line
				.replace(/\>\s*,\n/g, ">\n") // Network Ending
				.replace(/\.\s*,\n/g, ".\n") // Period Ending
				.replace(/(AND|BREAK|ADDROW|ADDCOL)\s*,\n/g, "$1\n"); // Keyword
		}

		if (autoRefresh) updateInput(textArea);
	}

	// #region Expression

	/** @param {string} input @returns {string} */
	static #toExpression(input) {
		return input
			.replace(/(?:,|\n|^)\s*> <\s*(?:,|\n|$)/g, ", $SHY$,")
			.replace(/(?:,|\n|^)\s*:3\s*(?:,|\n|$)/g, ", $CAT$,");
	}

	/** @param {string} input @returns {string} */
	static #fromExpression(input) {
		return input
			.replace("$SHY$", "> <")
			.replace("$CAT$", ":3");
	}

	// #region Network

	/** @type {Map<string, string>} */
	static #networkDB = new Map();

	/** @param {string} input @returns {string} */
	static #toNetwork(input) {
		this.#networkDB.clear();

		const output = input
			.replace(/(lbw=)?\s*(\d+(\.\d+)?)(\s*,\s*(\d+(\.\d+)?))+/g, (match) => {
				const UID = `@NET${this.#networkDB.size}WORK@`;
				this.#networkDB.set(UID, match.trim());
				return UID;
			})
			.replace(/\s*<.+?>\s*/g, (match) => {
				const UID = `@NET${this.#networkDB.size}WORK@`;
				this.#networkDB.set(UID, match.trim());
				return UID;
			});

		return output;
	}

	/** @param {string} input @returns {string} */
	static #fromNetwork(input) {
		const len = this.#networkDB.size;

		for (let i = len; i >= 0; i--) {
			const UID = `@NET${i}WORK@`;
			input = input.replace(UID, this.#networkDB.get(UID));
		}

		return input;
	}

	// #region Main

	/** @param {string} input @param {boolean} dedupe @param {boolean} rmUnderscore @returns {string} */
	static formatString(input, dedupe, rmUnderscore) {
		// Remove Whitespaces
		input = input.replace(/[^\S\n]/g, " ");

		// Substitute LoRAs
		input = this.#toNetwork(input);

		// Remove Underscore
		input = rmUnderscore ? this.#rmUnderscore(input) : input;

		// Special Tags
		input = this.#toExpression(input);

		// Restore LoRAs
		input = this.#fromNetwork(input);

		// Fix Bracket & Space
		input = input.replace(/\s+(\)|\]|\>|\})/g, "$1").replace(/(\(|\[|\<|\{)\s+/g, "$1");

		// Fix Commas inside Brackets
		input = input.replace(/,+(\)|\]|\>|\})/g, "$1,").replace(/(\(|\[|\<|\{),+/g, ",$1");

		// Remove Space around Syntax
		input = input.replace(/\s*\|\s*/g, "|").replace(/\s*\:\s*/g, ":");

		// Remove Comma before Period
		input = input.replace(/\,\s*\./g, ".");

		// Remove Space before last Period
		input = input.replace(/\s*\.(\n|$)/g, ".$1");

		// Sentence -> Tags
		let tags = input.split(",").map((word) => word.trim());

		// Remove Duplicate
		tags = dedupe ? this.#dedupe(tags) : tags;

		// Remove extra Spaces
		input = tags.join(", ").replace(/\s+/g, " ");

		// Remove Empty Brackets
		while (/\(\s*\)|\[\s*\]/.test(input)) input = input.replace(/\(\s*\)|\[\s*\]/g, "");

		// Space after Colon in Escaped Brackets for Franchise (due to "Remove Space around Syntax")
		input = input.replace(/\\\(([^\\\)]+?):([^\\\)]+?)\\\)/g, "\\($1: $2\\)");

		// Prune empty Chunks
		input = input
			.split(",")
			.map((word) => word.trim())
			.filter((word) => word)
			.join(", ");

		// LoRA Block Weights
		input = input.replace(/<.+?>/g, (match) => {
			return match.replace(/\,\s+/g, ",");
		});

		// Remove Space before Colon
		input = input.replace(/,\s*:(\d)/g, ":$1");

		input = this.#fromExpression(input);

		return input;
	}

	// #region Dedupe

	/** @param {string[]} input @returns {string[]} */
	static #dedupe(input) {
		const KEYWORD = /^(AND|BREAK|ADDROW|ADDCOL)$/;
		const uniqueSet = new Set();
		const results = [];

		for (const tag of input) {
			const cleanedTag = tag
				.replace(/\[|\]|\(|\)/g, "")
				.replace(/\s+/g, " ")
				.trim();

			if (KEYWORD.test(cleanedTag)) {
				results.push(tag);
				continue;
			}

			if (!isNaN(cleanedTag)) {
				results.push(tag);
				continue;
			}

			let substitute = null;
			for (const [pattern, mainTag] of this.#alias) {
				if (pattern.test(cleanedTag)) {
					substitute = mainTag;
					break;
				}
			}

			if (substitute == null && !uniqueSet.has(cleanedTag)) {
				uniqueSet.add(cleanedTag);
				results.push(tag);
				continue;
			}

			if (substitute != null && !uniqueSet.has(substitute)) {
				uniqueSet.add(substitute);
				results.push(tag.replace(cleanedTag, substitute));
				continue;
			}

			results.push(tag.replace(cleanedTag, ""));
		}

		return results;
	}

	// #region Underscore

	/** @param {string} input @returns {string} */
	static #rmUnderscore(input) {
		if (!input.trim()) return "";

		for (let i = 0; i < this.#cards.length; i++) input = input.replaceAll(this.#cards[i], `@T${i}I@`);

		input = input.replace(/(^|[^_])_([^_]|$)/g, "$1 $2");

		for (let i = 0; i < this.#cards.length; i++) input = input.replaceAll(`@T${i}I@`, this.#cards[i]);

		return input;
	}

	// #region Paste

	/** @param {HTMLTextAreaElement} field @param {pfConfigs} config */
	static processPaste(field, config) {
		/** https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/v1.10.1/modules/infotext_utils.py#L16 */
		const paramPatterns = /\s*(\w[\w \-/]+):\s*("(?:\\.|[^\\"])+"|[^,]*)(?:,|$)/g;

		field.addEventListener("paste", (event) => {
			/** @type {string} */ let paste = (event.clipboardData || window.clipboardData).getData("text");
			if ([...paste.matchAll(paramPatterns)].length > 3) return; // Infotext

			event.preventDefault();

			/** @type {boolean} */ const commaStart = paste.match(/^\s*\,/);
			/** @type {boolean} */ const commaEnd = paste.match(/\,\s*$/);

			/** @type {boolean} */ const onlyTags = !paste.includes(",");

			if (config.booru) {
				paste = this.#toNetwork(paste);
				paste = paste.replace(/\s*[\d.]+[kM]\s*|(?:^|,|\s+)\d+(?:\s+|,|\?|$)|[\?\+\-]\s+/g, ", ");
				for (const excl of ["Artist", "Characters", "Character", "Copyright", "Tags", "Tag", "General"])
					paste = paste.replace(excl, "");

				const franchise = /\w+(?:[\_\s]\(.+?\))+/g;
				paste = paste.replace(franchise, (match) => {
					return match.replace(/[()]/g, "\\$&");
				});
				paste = this.#fromNetwork(paste);
			}

			if (onlyTags) paste = this.formatString(paste, config.dedupe, config.rmUnderscore);
			else {
				const lines = [];
				for (const line of paste.split("\n")) lines.push(this.formatString(line, config.dedupe, config.rmUnderscore));
				paste = lines.join("\n");
			}

			paste = `${commaStart ? ", " : ""}${paste}${commaEnd ? ", " : ""}`;

			const currentText = field.value;
			const cursorPosition = field.selectionStart;

			const newText = currentText.slice(0, cursorPosition) + paste + currentText.slice(field.selectionEnd);
			field.value = newText;
			field.selectionStart = field.selectionEnd = cursorPosition + paste.length;

			updateInput(field);
			return false;
		});
	}
}

// #region Entry

(function () {
	onUiLoaded(() => {
		const config = new pfConfigs();
		const formatter = pfUI.setupUIs(config.autoRun, config.dedupe, config.rmUnderscore);

		document.addEventListener("keydown", (e) => {
			if (e.altKey && e.shiftKey && e.code === "KeyF") {
				e.preventDefault();
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(field, config.dedupe, config.rmUnderscore, config.refresh, config.comma);
			}
		});

		formatter.auto.addEventListener("change", () => {
			config.autoRun = formatter.auto.checked;
			formatter.manual.style.display = config.autoRun ? "none" : "flex";
		});

		formatter.dedupe.addEventListener("change", () => {
			config.dedupe = formatter.dedupe.checked;
		});

		formatter.underscore.addEventListener("change", () => {
			config.rmUnderscore = formatter.underscore.checked;
			formatter.refresh.style.display = config.rmUnderscore ? "flex" : "none";
		});

		formatter.manual.addEventListener("click", () => {
			for (const field of config.promptFields)
				LeFormatter.formatPipeline(field, config.dedupe, config.rmUnderscore, config.refresh, config.comma);
		});

		formatter.refresh.addEventListener("click", () => {
			LeFormatter.forceReload();
		});

		const tools = document.getElementById("quicksettings");
		tools.after(formatter);

		/** Expandable List of IDs in 1 place */
		const IDs = [
			"txt2img_generate",
			"txt2img_enqueue",
			"img2img_generate",
			"img2img_enqueue",
		];

		for (const id of IDs) {
			const button = document.getElementById(id);
			button?.addEventListener("click", () => {
				if (!config.autoRun) return;
				for (const field of config.promptFields)
					LeFormatter.formatPipeline(field, config.dedupe, config.rmUnderscore, config.refresh, config.comma);
			});
		}

		if (!config.paste) return;
		for (const field of config.promptFields) LeFormatter.processPaste(field, config);
	});
})();
