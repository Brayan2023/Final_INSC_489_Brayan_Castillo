const factorsToDisplay = [
    "MOTM",
    "Free Kick Goals",
    "Header",
    "Dribbles",
    "Hat-tricks",
    "Penalties",
];

// Read and process the CSV data
d3.csv("data/factors.csv").then(data => {
    data.forEach(d => {
        d.Messi = +d.Messi > 1000 ? +d.Messi / 10 : +d.Messi;
        d.Ronaldo = +d.Ronaldo > 1000 ? +d.Ronaldo / 10 : +d.Ronaldo;
    });

    // Filter the factors you want to display
    data = data.filter(d => factorsToDisplay.includes(d.Factors));

    createRadarChart(data);
});

function createRadarChart(data) {
    const width = 800;
    const height = 1000;
    const radius = Math.min(width, height) / 2;
    const levels = [312, 286, 260, 234, 208, 182, 156, 130, 104, 78, 52, 26];
    const angleSlice = (Math.PI * 2) / factorsToDisplay.length;

    // Find the maximum value in the dataset
    const maxValue = d3.max(data, d => Math.max(d.Messi, d.Ronaldo));

    // Create radial and angular scales
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);
    const angleScale = d3.scaleLinear().domain([0, factorsToDisplay.length]).range([0, Math.PI * 2]);

    // Create the SVG container
    const svg = d3.select("#StarPlot")
        .append("svg")
        .attr("width", width + 100)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2 + 30}, ${height / 2})`);

    // Draw concentric circles
    const circleAxes = svg.append("g").attr("class", "circleAxes");
    for (let i = 0; i < levels.length; i++) {
        const levelFactor = levels[i];
        circleAxes
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", rScale(levelFactor))
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width","0.5px");
    }

    // Draw axes
    const axes = svg.selectAll(".axis")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "axis");

    // Draw lines from the center to the maximum value for each factor
    axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(maxValue) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y2", (d, i) => rScale(maxValue) * Math.sin(angleScale(i) - Math.PI / 2))
        .style("stroke", "black")
        .style("stroke-width", "1px");

// Add axis labels
    axes.append("text")
        .attr("class", "axisLabel")
        .attr("x", (d, i) => (rScale(maxValue + 10)) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y", (d, i) => (rScale(maxValue + 10)) * Math.sin(angleScale(i) - Math.PI / 2))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(d => d.Factors)
        .each(function (d, i) {
            if (d.Factors === "Hat-tricks") {
                d3.select(this)
                    .attr("y", (rScale(maxValue + 10)) * Math.sin(angleScale(i) - Math.PI / 2) - 15);
            }
        });

    // Draw the radar areas
    const line = d3.lineRadial().curve(d3.curveCardinalClosed);

    // Add the radar areas (filled polygons)
    const radarArea = d3.areaRadial()
        .curve(d3.curveCardinalClosed) // Set the same curve type as the line generator
        .angle((d, i) => i-4.32 * angleSlice - Math.PI / 2)
        .innerRadius(0);

    // Draw the radar area for Messi
    svg.append("path")
        .datum(data)
        .attr("class", "radarAreaMessi")
        .attr("d", radarArea.outerRadius((d, i) => rScale(d.Messi)))
        .style("fill", "blue")
        .style("opacity", 0.7);

    // Draw the radar area for Ronaldo
    svg.append("path")
        .datum(data)
        .attr("class", "radarAreaRonaldo")
        .attr("d", radarArea.outerRadius((d, i) => rScale(d.Ronaldo)))
        .style("fill", "red")
        .style("opacity", 0.7);

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Add the radar points
    const points = svg.selectAll(".radarPoint")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "radarPoint");

    // Draw the radar points for Messi
    points.append("circle")
        .attr("class", "radarPointMessi")
        .attr("cx", (d, i) => rScale(d.Messi) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d.Messi) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("r", 5)
        .style("fill", "blue")
        .style("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("pointer-events", "auto");
            tooltip.html(`<strong>Messi:</strong> ${d.Messi}<br><strong>Factor:</strong> ${d.Factors}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("pointer-events", "none");
        });

    // Draw the radar points for Ronaldo
    points.append("circle")
        .attr("class", "radarPointRonaldo")
        .attr("cx", (d, i) => rScale(d.Ronaldo) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d.Ronaldo) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("r", 5)
        .style("fill", "red")
        .style("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("pointer-events", "auto");
            tooltip.html(`<strong>Ronaldo:</strong> ${d.Ronaldo}<br><strong>Factor:</strong> ${d.Factors}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("pointer-events", "none");
        });
}

// Add this line at the end of the file
export {};


