$(function () {

	// переключение подсветки
	function toggleHighlight(selection, is, delay) {
		selection
			.transition("color")
			.delay(delay)
			.attr("fill", d => (is ? "rgba(241, 64, 75, 1)" : colorScale(d.value)));
	}

	// случайный массив
	function randomArray(length) {
		const arr = [];

		for (let i = 0; i < length; i++) {
			arr.push(Math.round(Math.random() * 15) + 1);
		}

		return arr;
	}

	// настройки
	const config = {
		delay: 450,
		count: 13
	};

	const w = 600,
		h = 250;

	let dataset = randomArray(config.count),
		sorted = dataset.map((v, i) => ({
			index: i,
			value: v
		})),
		loop;

	// создаем scale для ширины баров и расположения по оси x
	const xScale = d3
			.scaleBand()
			.domain(d3.range(dataset.length))
			.rangeRound([0, w])
			.paddingInner(0.05),

		// создаем scale для цветов по значению
		colorScale = d3.scaleSequential(
			[d3.min(dataset), d3.max(dataset)],
			d3.interpolateGnBu
		),

		// создаем scale для высоты баров
		yScale = d3
			.scaleLinear()
			.domain([0, d3.max(dataset)])
			.range([0, h]),

		// создаем svg
		svg = d3
			.select("body")
			.append("div")
			.attr("class", "content")
			.append("div")
			.attr("class", "svg")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

	// инициализация свойств баров
	const initRects = selection => {
		selection
			.attr("id", d => "rect" + d.index)
			.attr("x", function (d, i) {
				return xScale(d.index);
			})
			.attr("y", function (d) {
				return h - yScale(d.value);
			})
			.attr("width", xScale.bandwidth())
			.attr("height", function (d) {
				return yScale(d.value);
			})
			.attr("fill", function (d) {
				return colorScale(d.value);
			});
	};

	let rects = svg
		.selectAll("rect")
		.data(sorted, d => d.index)
		.enter()
		.append("rect");

	initRects(rects);

	// инициализация свойств подписей
	const initLabels = selection => {
		selection
			.text(function (d) {
				return d.value;
			})
			.attr("text-anchor", "middle")
			.attr("x", function (d, i) {
				return xScale(d.index) + xScale.bandwidth() / 2;
			})
			.attr("y", function (d) {
				return h - yScale(d.value) + 14;
			})
			.attr("font-size", "10px")
			.attr("font-weight", "bold")
			.attr("fill", "black");
	};

	const labels = svg
		.selectAll("text")
		.data(sorted)
		.enter()
		.append("text");

	initLabels(labels);

	// обработчик генерации массива
	d3.select("#gen").on("click", () => {
		if (loop) {
			loop.stop();
		}

		dataset = randomArray(config.count);
		colorScale.domain([d3.min(dataset), d3.max(dataset)]);

		sorted = dataset.map((v, i) => ({
			index: i,
			value: v
		}));

		yScale.domain([0, d3.max(dataset)]);

		const tempRects = svg.selectAll("rect").data(sorted);

		tempRects.exit().remove();

		initRects(
			tempRects
				.enter()
				.append("rect")
				.merge(rects)
				.transition()
		);

		const tempLabels = svg.selectAll("text").data(sorted);

		tempLabels.exit().remove();

		initLabels(
			tempLabels
				.enter()
				.append("text")
				.merge(labels)
				.transition()
		);
	});

	// обработчик сортировки массива
	d3.select("#sort").on("click", () => {
		let i = 0,
			endI = dataset.length - 1,
			endJ,
			j = 0,
			wasSwap = false;

		if (loop) {
			loop.stop();
		}

		loop = d3.interval(() => {
			if (i < endI) {
				endJ = endI - i;

				if (j < endJ) {
					toggleHighlight(
						d3.selectAll(
							`rect:nth-child(${j + 1}),rect:nth-child(${j + 2})`
						),
						0.2 * config.delay,
						true
					);

					if (sorted[j].value > sorted[j + 1].value) {
						const swap = sorted[j];

						sorted[j].index = j + 1;
						sorted[j + 1].index = j;
						sorted[j] = sorted[j + 1];
						sorted[j + 1] = swap;

						svg
							.selectAll("rect")
							.data(sorted, d => d.index)
							.order()
							.transition("rect")
							.delay(0.4 * config.delay)
							.attr("x", d => xScale(d.index));
						svg
							.selectAll("text")
							.data(sorted, d => d.index)
							.order()
							.transition("text")
							.delay(0.4 * config.delay)
							.attr("x", d => xScale(d.index) + xScale.bandwidth() / 2);

						wasSwap = true;
					}

					toggleHighlight(
						d3.selectAll(
							`rect:nth-child(${j + 1}),rect:nth-child(${j + 2})`
						),
						false,
						0.6 * config.delay
					);

					j++;
				} else {
					i++;
					j = 0;

					if (!wasSwap) {
						loop.stop();
					}
				}
			} else {
				loop.stop();
			}
		}, config.delay);
	});

});
