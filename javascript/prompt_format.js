class LeFormatter {

	static injectButton(id, { onClick }) {
		const button = gradioApp().getElementById(id)
		button.addEventListener('click', onClick)
	}

	static checkbox(text, { onChange }) {
		const label = document.createElement('label')
		label.style.display = 'flex'
		label.style.alignItems = 'center'

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
	return input.replace(',)', '),').replace(',]', '],').replace('(,', ',(').replace('[,', ',[');
}

function fixBracketSpace(input) {
	return input.replace(' )', ')').replace(' ]', ']').replace('( ', '(').replace('[ ', '[');
}

function formatString(input, dedupe) {
	const tags = fixBracketComma(input).split(',').map(word => word.trim()).filter(word => word !== '');
	const sentence = dedupe ? [...new Set(tags)].join(', ') : tags.join(', ');
	return fixBracketSpace(sentence.replace(/\s+/g, ' ')).trim();
}

onUiLoaded(async () => {
	var dedupe = false

	// Checkbox
	const checkbox = LeFormatter.checkbox('Remove Duplicates', {
		onChange: (checked) => { dedupe = checked }
	})

	const tools = document.getElementById('quicksettings')
	tools.appendChild(checkbox)

	// Formatter
	LeFormatter.injectButton('txt2img_generate', {
		onClick: () => {
			const ids = ['txt2img_prompt', 'txt2img_neg_prompt']
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