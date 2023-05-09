// Set the dimensions and margins of the graph
const margin = {top: 10, right: 100, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select("#ScatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Load and format the data
d3.csv('data/Messi_vs_Ronaldo.csv').then(data => {
    data.forEach(d => {
        d.Year = +d.Year.split("/")[0];
        d.MessiAssists = +d.MessiAssists;
        d.RonaldoAssists = +d.RonaldoAssists;
        d.MessiGoals = +d.MessiGoals;
        d.RonaldoGoals = +d.RonaldoGoals;
    });

    let showingGoals = false;

    // Create the X-axis (year)
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");

    // Create the Y-axis (assists)
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.MessiAssists, d.RonaldoAssists, d.MessiGoals, d.RonaldoGoals))])
        .range([height, 0]);
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Y-axis label
    const yAxisLabel = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Assists");

    // Define the line generator for the connected scatter plot
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(showingGoals ? d.MessiGoals : d.MessiAssists));

    const line2 = d3.line()
        .x(d => x(d.Year))
        .y(d => y(showingGoals ? d.RonaldoGoals : d.RonaldoAssists));

    // Draw the lines and circles for Messi and Ronaldo
    const drawGraph = () => {
        svg.selectAll(".messiLine, .ronaldoLine, .messiDot, .ronaldoDot").remove();

        // Add Messi's line
        svg.append("path")
            .datum(data)
            .attr("class", "messiLine")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add Ronaldo's line
        svg.append("path")
            .datum(data)
            .attr("class", "ronaldoLine")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", line2);

        // Add Messi's dots
        svg.selectAll(".messiDot")
            .data(data)
            .join("circle")
            .attr("class", "messiDot")
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(showingGoals ? d.MessiGoals : d.MessiAssists))
            .attr("r", 4)
            .attr("fill", "blue")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Year: ${d.Year}<br>${showingGoals ? "Goals" : "Assists"}: ${showingGoals ? d.MessiGoals : d.MessiAssists}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add Ronaldo's dots
        svg.selectAll(".ronaldoDot")
            .data(data)
            .join("circle")
            .attr("class", "ronaldoDot")
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(showingGoals ? d.RonaldoGoals : d.RonaldoAssists))
            .attr("r", 4)
            .attr("fill", "red")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Year: ${d.Year}<br>${showingGoals ? "Goals" : "Assists"}: ${showingGoals ? d.RonaldoGoals : d.RonaldoAssists}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    };

    // Initial draw
    drawGraph();

    // Toggle between goals and assists when the button is clicked
    d3.select("#toggleButton").on("click", () => {
        showingGoals = !showingGoals;
        d3.select("#toggleButton").text(showingGoals ? "Assists by Season" : "Goals by Season");
        yAxisLabel.text(showingGoals ? "Goals" : "Assists");
        drawGraph();
    });
});