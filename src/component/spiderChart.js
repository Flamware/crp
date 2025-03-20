import React from "react";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const QualityRadarChart = ({ qualityCount }) => {
    // Extract qualities (labels) and their counts (data) from the passed qualityCount map
    const qualities = Object.keys(qualityCount);
    const counts = qualities.map((quality) => qualityCount[quality]);

    const chartData = {
        labels: qualities,
        datasets: [
            {
                label: "Nombre de qualités", // Translated to French
                data: counts,
                backgroundColor: "rgba(34, 202, 236, 0.2)",
                borderColor: "rgba(34, 202, 236, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(34, 202, 236, 1)",
            },
        ],
    };

    const options = {
        maintainAspectRatio: false, // Allow the chart to stretch to fit the container
        scales: {
            r: {
                angleLines: { display: true },
                ticks: { display: false }, // Hide only numeric tick labels
                suggestedMin: 0,
                suggestedMax: Math.max(...counts, 1) + 1,
                pointLabels: {
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12, // Responsive font size for labels
                    },
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12, // Responsive font size for legend
                    },
                },
            },
            tooltip: {
                bodyFont: {
                    size: window.innerWidth < 640 ? 10 : 12, // Responsive font size for tooltips
                },
            },
        },
    };

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-full h-full max-w-[400px] max-h-[400px] min-w-[250px] min-h-[250px]">
                <Radar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default QualityRadarChart;