// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 850 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#BarGraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",`translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("data/factors.csv").then( function(data) {

    // Filter data to only include Shots and Shots on Target for Messi and Ronaldo
    const filteredData = data.filter(d => (d.Factors === 'Shots' || d.Factors === 'Shots on Target')
        && (d.Messi || d.Ronaldo));

    // Set the groups to Messi and Ronaldo
    const groups = ['Messi', 'Ronaldo'];

    // Add X axis
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

// Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.Messi > +d.Ronaldo ? +d.Messi : +d.Ronaldo)])
        .range([height, 0]);
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));
    yAxis.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("fill", "black")
        .text("Shots Total");

// Color palette for each player and factor
    const color = d3.scaleOrdinal()
        .domain(groups.flatMap(g => [g + "_Shots", g + "_Shots on Target"]))
        .range(['#4794de', '#07097e', '#e35b58', '#881804']); // Lighter shades for shots, darker shades for shots on target

    // Separate the data into two arrays, one for Messi and one for Ronaldo
    const messiData = filteredData.filter(d => d.Messi);
    const ronaldoData = filteredData.filter(d => d.Ronaldo);

    // Define the tooltip interaction functions
    const mouseover = function (event, d) {
        const playerName = d3.select(this).attr("class");
        const value = d.Factors === "Shots" ? d[playerName] : d[playerName];
        tooltip
            .html("Player: " + playerName + "<br>" + "Value: " + value)
            .style("opacity", 1)
    }
    const mousemove = function (event, d) {
        tooltip.style("transform", "translateY(-55%)")
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 30 + "px")
    }
    const mouseleave = function (event, d) {
        tooltip
            .style("opacity", 0)
    }

// Add the bars for Messi
    svg.selectAll("rect.messi")
        .data(messiData)
        .enter()
        .append("rect")
        .attr("class", "Messi")
        .attr("x", d => x('Messi'))
        .attr("y", d => y(+d.Messi))
        .attr("height", d => height - y(+d.Messi))
        .attr("width", x.bandwidth() / 2)
        .attr("fill", d => color("Messi_" + d.Factors))
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

// Add the bars for Ronaldo
    svg.selectAll("rect.ronaldo")
        .data(ronaldoData)
        .enter()
        .append("rect")
        .attr("class", "Ronaldo")
        .attr("x", d => x('Ronaldo') + x.bandwidth() / 2)
        .attr("y", d => y(+d.Ronaldo))
        .attr("height", d => height - y(+d.Ronaldo))
        .attr("width", x.bandwidth() / 2)
        .attr("fill", d => color("Ronaldo_" + d.Factors))
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

// ----------------
// Create a tooltip
// ----------------
    const tooltip = d3.select("#BarGraph")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

// ----------------
// Create a legend
// ----------------
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(groups.flatMap(g => [g + "_Shots", g + "_Shots on Target"]))
        .enter().append("g")
        .attr("transform", (d, i) => "translate(" + (i % 2) * 180 + "," + Math.floor(i / 2) * 20 + ")");

    legend.append("rect")
        .attr("x", width + 15)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width + 10)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => {
            const [playerName, factor] = d.split('_');
            return playerName + ": " + factor;
        });
});
