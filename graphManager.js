////////////////////////////////////////////////////////////////////////

var width = 1400;
var height = 900;
var color = d3.scale.category20();
  
//create the force layout
var force = d3.layout.force()
    .charge(-50)
    .linkDistance(5)
    .size([width, height]);
 
 //create d3 drawing object
 var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", RedrawGraph))
    .append('svg:g');
 
 //create background to accept mouse events
svg.append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white");

//load the json and do something with it
d3.json("networkData.json", function(json) 
{
    CreateForceDirectedGraph(json)
 });

//use the given json of nodes and edges
//to make a force directed graph
function CreateForceDirectedGraph(json)
{
    force
        .nodes(json.nodes)
        .links(json.edges)
        .start();
 
    var edge = svg.selectAll("line.edge")
        .data(json.edges)
        .enter().append("line")
        .attr("class", "edge")
        .style("stroke-width", function(d) 
            {
                maxWidth = 5
                strokeWidth = (1 - d.normalizedTransitTimeBetweenNodes) * (maxWidth-1) + 1;
                return (strokeWidth); 
            })
        .on("mouseover", OnMouseOver_edge)
        .on("mouseout", OnMouseOut_edge);
     
    var node = svg.selectAll("circle.node")
        .data(json.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d)
            {
                rMin = 3;
                rMax = 12;
                rNew = d.degree;
                if (rNew > rMax) {rNew = rMax;}
                if (rNew < rMin) {rNew = rMin;}
                return rNew; 
            })
        .style("fill", function(d)
            {
                return "#ff0000";
                //return color(5); 
            })
        .on("mouseover", OnMouseOver_node)
        .on("mouseout", OnMouseOut_node)
        .call(force.drag);
     
    node.append("title")
        .text(function(d) { return d.ip; });

    node.each(function(d, i) 
        {
            d.index_node = i;
        });

    edge.append("title")
        .text(function(d) { return d.transitTimeBetweenNodes.toString() + " ms"; });
     
     force.on("tick", function() 
     {
        edge.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
     
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      });
}


/////////////////////////////////////
//callbacks
/////////////////////////////////////

function OnMouseOver_node(d, i)
{
    Node = d3.select(this);
    ScaleUpNode(Node);
}

function OnMouseOut_node(d, i)
{
    Node = d3.select(this);
    ScaleDownNode(Node);
}

function OnMouseOver_edge(d, i)
{
    Edge = d3.select(this);
    HighlightEdge(Edge);

}

function OnMouseOut_edge(d, i)
{
    Edge = d3.select(this);
    UnHighlightEdge(Edge);
}


/////////////////////////////////////
//utilities
/////////////////////////////////////

function HighlightEdge(Edge)
{
    Edge
        .transition()
        .style("stroke", "#ff0000")
        .duration(500);
}

function UnHighlightEdge(Edge)
{
    Edge
        .transition()
        .style("stroke", "#999")
        .duration(1200);
}

function ScaleUpNode(Node)
{
    Node
        .transition()
        .attr("r", 20)
        .style("fill", "#0000ff")
        .ease("elastic", 1.2, .45)
        .duration(500);
}

function ScaleDownNode(Node)
{
    Node        
        .transition()
        .attr("r", function(d)
            {           
                rMin = 3;
                rMax = 12;
                rNew = d.degree;
                if (rNew > rMax) {rNew = rMax;}
                if (rNew < rMin) {rNew = rMin;}
                return rNew; 
            })
        .style("fill", "#ff0000")
        .duration(400); 
}

 function RedrawGraph()
 {
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
 }
