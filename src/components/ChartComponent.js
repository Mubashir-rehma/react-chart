// src/components/ChartComponent.js
import React, { useState, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	LineElement,
	BarElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import "./ChartComponent.css";

// Register required components
ChartJS.register(
	LineElement,
	BarElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
	Filler,
	annotationPlugin
);

// Custom plugin for rendering images with data
const imagePlugin = {
	id: "customImage",
	afterDatasetsDraw(chart) {
		const {
			ctx,
			chartArea: { top, bottom, left, right },
			scales: { x, y },
		} = chart;
		chart.data.datasets.forEach((dataset, datasetIndex) => {
            const lastIndex = dataset.data.length - 1;
			const image = new Image();
			image.src = dataset.endpointImage || `${process.env.PUBLIC_URL}/endpoint.png`;
			const endPointValue = `${dataset.label} ${
				dataset.data[lastIndex]
			}`;
			dataset.data.forEach((value, index) => {
				if (index === lastIndex) {
					const xPos = x.getPixelForValue(index);
					const yPos = y.getPixelForValue(value);
					// ctx.drawImage(image, xPos - 5, yPos - 20, 20, 20);
					// Set padding and dimensions for the image
					const padding = 0;
					const imageSize = 30;
					const radius = (imageSize + padding) / 2;

					// Create a circular clipping region with padding
					ctx.save();
					ctx.beginPath();
					ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI);
					ctx.clip();

					// Draw the image within the clipping region, centered
					ctx.drawImage(
						image,
						xPos - imageSize / 2,
						yPos - imageSize / 2,
						imageSize,
						imageSize
					);
					ctx.restore();

					// Draw a border around the image
					ctx.beginPath();
					ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI);
					ctx.strokeStyle = dataset.backgroundColor;
					ctx.lineWidth = 3;
					ctx.stroke();

					ctx.font = "Bold 15px Arial";
					ctx.fillStyle = dataset.backgroundColor;
					ctx.textAlign = "center"; // Center text
                    
                    const textMetrics = ctx.measureText(endPointValue);
                    const textWidth = textMetrics.width;
                    const textHeight = 20; // Approximate height, adjust as needed
                    
                    // Draw background for text only
                    ctx.fillStyle = datasetIndex === 0 ? 'rgba(75,192,192,0.2)' : 'rgba(153,102,255,0.2)';
                    ctx.fillRect(xPos - textWidth / 2 - 5, yPos - 40, textWidth + 18, textHeight);
                    
                    // Draw text
                    ctx.fillStyle = dataset.borderColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
					ctx.fillText(endPointValue, xPos + 1, yPos - 30);
                    // ctx.fillText(endPointValue, xPos, yPos - 40);

				}
			});
		});
	},
};

// Register the custom plugin
ChartJS.register(imagePlugin);

const ChartComponent = () => {
	const [chartType, setChartType] = useState("line");
	const chartRef = useRef(null); // Add ref to the chart

	const data = {
		labels: ["January", "February", "March", "April", "May", "June", "July"],
		datasets: [
			{
				label: "Appl",
				data: [65, 59, 80, 81, 56, 55, 40],
				borderColor: "rgba(75,192,192,1)",
				backgroundColor: "rgba(75,192,192,0.4)",
				fill: false,
				pointRadius: 0,
				borderDash: [],
				endpointImage: `${process.env.PUBLIC_URL}/image1.png`,
                
			},
			{
				label: "Google",
				data: [28, 48, 40, 19, 86, 27, 90],
				borderColor: "rgba(153,102,255,1)",
				backgroundColor: "rgba(153,102,255,0.4)",
				fill: false,
				pointRadius: 0,
				borderDash: [5, 5],
				endpointImage: `${process.env.PUBLIC_URL}/image2.png`,
			},
		],
	};

	const options = {
		plugins: {
			legend: {
				display: true,
				labels: {
					usePointStyle: true,
				},
				position: "top",
				color: "#dadada",
			},
			annotation: {
				annotations: [
					...data.datasets
						.map((dataset) => {
                            
							const maxIndex = dataset.data.reduce(
								(maxIdx, value, idx, array) =>
									value > array[maxIdx] ? idx : maxIdx,
								0
							);
							const endPointValue = dataset.data[dataset.data.length - 1];
							const endPointLabel = data.labels[data.labels.length - 1];

							return [
								{
									type: "point",
									xValue: endPointLabel,
									yValue: endPointValue,
									backgroundColor: "transparent",
									radius: 0,
									borderWidth: 0,
								},
								{
									type: "point",
									xValue: data.labels[maxIndex],
									yValue: dataset.data[maxIndex],
									backgroundColor: "transparent",
									radius: 0,
									borderWidth: 0,
									label: {
										enabled: true,
										content: `${dataset.data[maxIndex]}`,
										position: "top",
										backgroundColor: "rgba(255,99,132,0.8)",
										font: {
											size: 12,
											weight: "bold",
											color: "white",
										},
									},
								},
							];
						})
						.flat(),
				],
			},
			customImage: {}, // Enable the custom plugin
			tooltip: {
				mode: "index",
				intersect: false,
				callbacks: {
					label: function (tooltipItem) {
						return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
					},
				},
			},
		},
		hover: {
			mode: "index",
			intersect: false,
		},
		layout: {
			padding: {
				right: 60, // Add padding to the right to ensure images are fully visible
                top: 20,
			},
			border: {
				right: 1,
			},
		},
		scales: {
			x: {
				display: true,
				type: "category",
				grid: {
					display: false,
				},
			},
			y: {
				display: true,
				type: "linear",
				grid: {
					display: true,
					color: "#e9e9e9",
				},
				color: "#dadada",
			},
		},
		elements: {
			line: {
				tension: 0, // Disable bezier curves
				borderWidth: 2, // Set the line width
				// borderDash: [5, 5]  // Dashed line
			},
		},
	};

	const downloadChart = () => {
		const chart = chartRef.current;
		if (chart) {
			const url = chart.toBase64Image();
			const link = document.createElement("a");
			console.log(url);
			link.href = url;
			link.download = "chart.png";
			link.click();
		}
	};

	return (
		<div
			className="chart-container"
			style={{ width: "600px", backgroundColor: "#F5F5F5 ", padding: "20px" }}
		>
			<div className="header">
				<img
					src={`${process.env.PUBLIC_URL}/logo.png`}
					alt="Logo"
					className="logo"
				/>
				<div>
					<label>
						<div className="custom-checkbox">
							<input
								type="checkbox"
								checked={chartType === "bar"}
								onChange={() =>
									setChartType(chartType === "line" ? "bar" : "line")
								}
							/>
							<span className="checkmark"></span>
						</div>
						Bar Chart
					</label>

					<button onClick={downloadChart} style={{ marginLeft: "10px" }}>
                        <i className="fas fa-download"></i>
					</button>
				</div>
			</div>
			{chartType === "line" ? (
				<Line ref={chartRef} data={data} options={options} />
			) : (
				<Bar ref={chartRef} data={data} options={options} />
			)}
		</div>
	);
};

export default ChartComponent;
