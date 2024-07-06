// Custom plugin for rendering images
const imagePlugin = {
    id: 'customImage',
    afterDatasetsDraw(chart, args, options) {
        const { ctx, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;
        const image = new Image();
        image.src = `${process.env.PUBLIC_URL}/endpoint.png`;

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            dataset.data.forEach((value, index) => {
                if (index === dataset.data.length - 1) {
                    const xPos = x.getPixelForValue(index);
                    const yPos = y.getPixelForValue(value);
                    ctx.drawImage(image, xPos - 10, yPos - 10, 20, 20);
                }
            });
        });
    }
};

// Register the custom plugin
ChartJS.register(imagePlugin);
