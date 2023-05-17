class LeFormatter {

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'
		label.style.margin = '2px 8px'

		const checkbox = gradioApp().querySelector('input[type=checkbox]').cloneNode()
		checkbox.checked = false
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

}

function fixBracketComma(input) {
	return input.replace(/,\)/g, '),').replace(/,\]/g, '],').replace(/\(,/g, ',(').replace(/\[,/g, ',[');
}

function fixBracketSpace(input) {
	return input.replace(/ \)/g, ')').replace(/ \]/g, ']').replace(/\( /g, '(').replace(/\[ /g, '[');
}

function fixBracketEmpty(input) {
	return input.replace(/\(\)/g, '').replace(/\[\]/g, '')
}

function formatString(input, dedupe, deunderline) {
	const tags = fixBracketComma(input).split(',').map(word => (deunderline ? word.replace(/_/g, ' ').trim() : word.trim())).filter(word => word !== '');
	const sentence = dedupe ? [...new Set(tags)].join(', ') : tags.join(', ');
	return fixBracketEmpty(fixBracketSpace(sentence.replace(/\s+/g, ' ')).trim());
}

onUiLoaded(async () => {
	var dedupe = false
	var deunderline = false

	// Checkbox
	const dedupeCB = LeFormatter.checkbox('Remove Duplicates', {
		onChange: (checked) => { dedupe = checked }
	})

	const underlineCB = LeFormatter.checkbox('Remove Underscores', {
		onChange: (checked) => { deunderline = checked }
	})

	let formatter = document.createElement('div')
	formatter.id = 'le-formatter'
	formatter.style.display = 'flex';
	formatter.style.flex.direction = 'row';

	formatter.appendChild(dedupeCB)
	formatter.appendChild(underlineCB)

	const tools = document.getElementById('quicksettings')
	tools.after(formatter)

	// Formatter
	LeFormatter.injectButton('txt2img_generate', {
		onClick: () => {
			const ids = ['txt2img_prompt', 'txt2img_neg_prompt']
			const textAreas = [gradioApp().getElementById(ids[0]).querySelector('textarea'), gradioApp().getElementById(ids[1]).querySelector('textarea')]

			var lines = [textAreas[0].value.split('\n'), textAreas[1].value.split('\n')]

			for (let i = 0; i < lines[0].length; i++)
				lines[0][i] = formatString(lines[0][i], dedupe, deunderline)

			for (let i = 0; i < lines[1].length; i++)
				lines[1][i] = formatString(lines[1][i], dedupe, deunderline)


			textAreas[0].value = lines[0].join('\n')
			updateInput(textAreas[0])

			textAreas[1].value = lines[1].join('\n')
			updateInput(textAreas[1])
		}
	})

	LeFormatter.injectButton('img2img_generate', {
		onClick: () => {
			const ids = ['img2img_prompt', 'img2img_neg_prompt']
			const textAreas = [gradioApp().getElementById(ids[0]).querySelector('textarea'), gradioApp().getElementById(ids[1]).querySelector('textarea')]

			var lines = [textAreas[0].value.split('\n'), textAreas[1].value.split('\n')]

			for (let i = 0; i < lines[0].length; i++)
				lines[0][i] = formatString(lines[0][i], dedupe)

			for (let i = 0; i < lines[1].length; i++)
				lines[1][i] = formatString(lines[1][i], dedupe)


			textAreas[0].value = lines[0].join('\n')
			updateInput(textAreas[0])

			textAreas[1].value = lines[1].join('\n')
			updateInput(textAreas[1])
		}
	})

})