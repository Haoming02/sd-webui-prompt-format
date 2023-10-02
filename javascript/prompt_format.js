class LeFormatter {

	// ===== Cache Embedding & LoRA Prompts =====
	static cachedCards = null

	static cache_Cards() {
		this.cachedCards = []

		const extras = document.getElementById('txt2img_extra_tabs').querySelectorAll('span.name')
		extras.forEach((card) => {
			if (card.innerHTML.includes('_'))
				this.cachedCards.push(card.innerHTML)
		})
	}

	// ===== UI Related =====
	static manualButton({ onClick }) {
		const button = gradioApp().getElementById('txt2img_generate').cloneNode()

		button.id = 'manual-format'
		button.classList.remove('gr-button-lg', 'gr-button-primary', 'lg', 'primary')
		button.classList.add('secondary')
		button.style.borderRadius = '0.5em'
		button.textContent = 'Format'

		button.addEventListener('click', onClick)

		return button
	}

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, default_value, { onChange }) {
		const label = document.createElement('label')

		label.style.display = 'flex'
		label.style.alignItems = 'center'
		label.style.margin = '2px 8px'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()

		checkbox.checked = default_value
		checkbox.addEventListener('change', (event) => {
			onChange(event.target.checked)
		})

		const span = document.createElement('span')
		span.style.marginLeft = 'var(--size-2, 4px)'
		span.textContent = text

		label.appendChild(checkbox)
		label.appendChild(span)

		return label
	}

	// ===== Main Format Logics =====
	static formatPipeline(id, dedupe, removeUnderscore, autoRefresh) {
		let textArea = null

		try {
			textArea = gradioApp().getElementById(id).querySelector('textarea')
		}
		catch {
			return;
		}

		let lines = textArea.value.split('\n')

		for (let i = 0; i < lines.length; i++)
			lines[i] = LeFormatter.formatString(lines[i], dedupe, removeUnderscore)

		textArea.value = lines.join('\n')
		if (autoRefresh)
			updateInput(textArea)
	}

	static removeUnderscoreSmart(remove, tag) {
		if (!remove)
			return tag

		// [start:end:step] OR <lora:name:str>
		const chucks = tag.split(':').map(c => c.trim())

		for (let i = 0; i < chucks.length; i++) {
			if (!this.cachedCards.includes(chucks[i]))
				chucks[i] = chucks[i].replace(/_/g, ' ')
		}

		return chucks.join(':')
	}

	static formatString(input, dedupe, removeUnderscore) {
		// Remove Duplicate
		if (dedupe) {
			const temp = input.split(',')

			const cleanArray = []
			const finalArray = []

			temp.forEach((tag) => {
				const cleanedTag = tag.replace(/\[|\]|\(|\)|\s+/g, '').trim()

				if (/^(AND|BREAK)$/.test(cleanedTag)) {
					finalArray.push(cleanedTag)
					return;
				}

				if (!cleanArray.includes(cleanedTag)) {
					cleanArray.push(cleanedTag)
					finalArray.push(tag)
					return;
				}

				finalArray.push(tag.replace(cleanedTag, ''))
			})

			input = finalArray.join(', ')
		}

		// Fix Bracket & Comma
		input = input.replace(/,\s*\)/g, '),').replace(/,\s*\]/g, '],').replace(/\(\s*,/g, ',(').replace(/\[\s*,/g, ',[')

		// Remove Commas
		let tags = input.split(',').map(word => this.removeUnderscoreSmart(removeUnderscore, word.trim())).filter(word => word !== '')

		// Remove Stray Brackets
		const patterns = [/^\(+$/, /^\)+$/, /^\[+$/, /^\]+$/]
		tags = tags.filter(word => !patterns[0].test(word)).filter(word => !patterns[1].test(word)).filter(word => !patterns[2].test(word)).filter(word => !patterns[3].test(word))

		// Remove Spaces
		input = tags.join(', ').replace(/\s+/g, ' ')

		// Fix Bracket & Space
		input = input.replace(/\s+\)/g, ')').replace(/\s+\]/g, ']').replace(/\(\s+/g, '(').replace(/\[\s+/g, '[')

		// Fix Empty Bracket
		input = input.replace(/\(\s+\)/g, '').replace(/\[\s+\]/g, '')

		while (input.match(/\(\s*\)|\[\s*\]/g))
			input = input.replace(/\(\s*\)|\[\s*\]/g, '')

		return input.split(',').map(word => word.trim()).filter(word => word !== '').join(', ')
	}

	static grabBrackets(str, index) {
		let openBracket = -1
		let closeBracket = -1

		for (let i = index; i >= 0; i--) {
			if (str[i] === '(') {
				openBracket = i
				break;
			}
			if (str[i] === ')' && i !== index) {
				break;
			}
		}

		for (let i = index; i < str.length; i++) {
			if (str[i] === ')') {
				closeBracket = i
				break;
			}
			if (str[i] === '(' && i !== index) {
				break;
			}
		}

		if (openBracket !== -1 && closeBracket !== -1 && openBracket !== closeBracket)
			return [openBracket, closeBracket]
		else
			return null
	}

	static injectTagShift(id) {
		let textArea = null

		try {
			textArea = gradioApp().getElementById(id).querySelector('textarea')
		}
		catch {
			return;
		}

		textArea.addEventListener('wheel', (event) => {
			if (event.shiftKey) {
				event.preventDefault()

				if (textArea.selectionStart !== textArea.selectionEnd)
					return;

				if (event.deltaY === 0)
					return;

				const shift = event.deltaY < 0 ? 1 : -1
				const tags = textArea.value.split(',').map(t => t.trim())

				var cursor = textArea.selectionStart

				var index = 0

				for (let i = 0; i < textArea.selectionStart; i++) {
					if (textArea.value[i] === ',')
						index++
				}

				if (index === 0 && shift === -1)
					return;
				if (index === tags.length - 1 && shift === 1)
					return;

				const shifted = []

				if (shift < 0) {
					for (let i = 0; i < index - 1; i++)
						shifted.push(tags[i])

					shifted.push(tags[index])
					shifted.push(tags[index - 1])

					cursor -= tags[index - 1].length + 2

					for (let i = index + 1; i < tags.length; i++)
						shifted.push(tags[i])
				} else {
					for (let i = 0; i < index; i++)
						shifted.push(tags[i])

					shifted.push(tags[index + 1])
					shifted.push(tags[index])

					cursor -= tags[index + 1].length * -1 - 2

					for (let i = index + 2; i < tags.length; i++)
						shifted.push(tags[i])
				}

				textArea.value = shifted.join(', ')

				textArea.selectionStart = cursor
				textArea.selectionEnd = cursor

				updateInput(textArea)
			}
		})
	}

	static injectBracketEscape(id) {
		let textArea = null

		try {
			textArea = gradioApp().getElementById(id).querySelector('textarea')
		}
		catch {
			return;
		}

		textArea.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.key === '\\') {
				event.preventDefault()

				let cursorPosition = textArea.selectionStart

				if (textArea.selectionStart !== textArea.selectionEnd)
					cursorPosition++

				let result = LeFormatter.grabBrackets(textArea.value, cursorPosition)

				if (result) {
					const original = textArea.value

					if (result[0] !== 0 && textArea.value[result[0] - 1] === '\\' && textArea.value[result[1] - 1] === '\\') {
						textArea.value = original.slice(0, result[0] - 1) + original.slice(result[0] - 1, result[1]).replace(/\\/g, '') + original.slice(result[1])
						textArea.selectionStart = result[0] - 1
						textArea.selectionEnd = result[1] - 1
					}
					else {
						textArea.value = original.slice(0, result[0]) + '\\' + original.slice(result[0], result[1]) + '\\' + original.slice(result[1])
						textArea.selectionStart = result[0]
						textArea.selectionEnd = result[1] + 3
					}

					updateInput(textArea)
				}
			}
		})
	}

	// ===== Load Settings =====
	static shouldRefresh() {
		const config = gradioApp().getElementById('setting_pf_disableupdateinput').querySelector('input[type=checkbox]')
		return !config.checked
	}
}

onUiLoaded(async () => {
	const Modes = ['txt', 'img']

	let autoRun = true
	let dedupe = true
	let removeUnderscore = false

	const manualBtn = LeFormatter.manualButton({
		onClick: () => {
			const ids = ['txt2img_prompt', 'txt2img_neg_prompt', 'img2img_prompt', 'img2img_neg_prompt', 'hires_prompt', 'hires_neg_prompt']
			ids.forEach((id) => LeFormatter.formatPipeline(id, dedupe, removeUnderscore, true))
		}
	})

	manualBtn.style.display = 'none'

	const autoCB = LeFormatter.checkbox('Auto Format', autoRun, {
		onChange: (checked) => {
			autoRun = checked
			manualBtn.style.display = autoRun ? 'none' : 'block'
		}
	})

	const dedupeCB = LeFormatter.checkbox('Remove Duplicates', dedupe, {
		onChange: (checked) => { dedupe = checked }
	})

	const underlineCB = LeFormatter.checkbox('Remove Underscores', removeUnderscore, {
		onChange: (checked) => {
			removeUnderscore = checked
			if (LeFormatter.cachedCards == null)
				LeFormatter.cache_Cards()
		}
	})

	const formatter = document.createElement('div')
	formatter.id = 'le-formatter'
	formatter.style.display = 'flex'
	formatter.style.flex.direction = 'row'

	formatter.appendChild(autoCB)
	formatter.appendChild(manualBtn)
	formatter.appendChild(dedupeCB)
	formatter.appendChild(underlineCB)

	const tools = document.getElementById('quicksettings')
	tools.after(formatter)

	Modes.forEach((mode) => {

		LeFormatter.injectButton(mode + '2img_generate', {
			onClick: () => {
				if (!autoRun)
					return;

				const ids = [mode + '2img_prompt', mode + '2img_neg_prompt']
				ids.forEach((ID) => LeFormatter.formatPipeline(ID, dedupe, removeUnderscore, LeFormatter.shouldRefresh()))

				if (mode === 'txt') {
					const hires_id = ['hires_prompt', 'hires_neg_prompt']
					hires_id.forEach((hID) => LeFormatter.formatPipeline(hID, dedupe, removeUnderscore, LeFormatter.shouldRefresh()))
				}
			}
		})

		LeFormatter.injectBracketEscape(mode + '2img_prompt')
		LeFormatter.injectBracketEscape(mode + '2img_neg_prompt')
		LeFormatter.injectTagShift(mode + '2img_prompt')
		LeFormatter.injectTagShift(mode + '2img_neg_prompt')
	})

	LeFormatter.injectBracketEscape('hires_prompt')
	LeFormatter.injectBracketEscape('hires_neg_prompt')
	LeFormatter.injectTagShift('hires_prompt')
	LeFormatter.injectTagShift('hires_neg_prompt')
})
