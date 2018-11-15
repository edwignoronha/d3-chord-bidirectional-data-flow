//*******************************************************************
//  CREATE MATRIX AND MAP
//*******************************************************************
var globaldata = null;
var data2;
var matrix, mmap, rdr, chord;
var svg, arc, path;
var w = window.innerWidth || document.body.clientWidth,
    h = 700,
    r1 = h / 2,
    r0 = r1 - 150;
var opacityDefault = 0.8;
var fill = d3.scale.ordinal()
    .domain(d3.range(5))
    .range(["#de09b1", "#ff545c", "#fee819", "#50db3a", '#0cb4db', '#001eff']);

d3.csv('data/out.csv', function(error, data) {
    globaldata = data;
    data2 = d3.set(globaldata.map(function(d) {
        return d.Timeband;
    })).values();
    data3 = []
    data2.forEach(function(item,index){
        data3[index] = item.split('-')[0];
    });

    newdata = globaldata.filter(function(d) {
        return d.Timeband == data2[0];
    });
    var mpr = chordMpr(newdata);

    mpr
        .addValuesToMap('Source')
        .setFilter(function(row, a, b) {
            return (row.Source === a.name && row.Destination === b.name)
        })
        .setAccessor(function(recs, a, b) {
            if (!recs[0]) return 0;
            return +recs[0].Count;
        });

    matrix = mpr.getMatrix();
    mmap = mpr.getMap();
    sortData();
    drawChords();
});

function getDefaultLayout() {
    var chord1 = d3.layout.chord()
        .padding(.15)
        .sortChords(d3.descending);
    return chord1;
}

function sortData() {
    var sortOrder = ["Segment A", "Segment B", "Segment C", "Segment D", "Segment E", "Segment F"];

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key].id === value);
    }

    Object.keys(mmap).forEach(function(key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        currind = mmap[key].id;
        newid = sortOrder.indexOf(key);

        if (currind == newid) {
            return;
        }

        temp = matrix[newid]
        matrix[newid] = matrix[currind]
        matrix[currind] = temp

        matrix.forEach(function(item1, index1) {
            item = item1
            temp1 = item[newid]
            item[newid] = item[currind]
            item[currind] = temp1
            matrix[index1] = item
        });


        mmap[key].id = 99;
        mmap[getKeyByValue(mmap, newid)].id = currind;
        mmap[getKeyByValue(mmap, 99)].id = newid;
    });
}


function updateChords() {
    chord = getDefaultLayout(); //create a new layout object 
    rdr = chordRdr(matrix, mmap);
    chord.matrix(matrix);

    var g = svg.selectAll("g.group")
        .data(chord.groups());

    g.exit()
        .transition()
        .duration(10)
        .attr("opacity", 0)
        .remove();

    g.enter().append("svg:g")
        .attr("class", "group")
        .on("mouseover", fade(.2))
        .on("mouseout", fade(opacityDefault));

    var paths = g.selectAll("path.arcs");

    paths.transition()
        .duration(10)
        .attr("opacity", 0)
        .remove();

    paths = g.append("svg:path")
        .style("stroke", function(d) {
            return fillcolor(rdr(d).gname);
        })
        .style("fill", function(d) {
            return fillcolor(rdr(d).gname);
        })
        .attr("id", function(d, i) {
            return "group" + d.index;
        })
        .attr("d", arc)
        .attr("class", "arcs");

    var images1 = g.select("image.groupimage");

    images1.transition()
        .duration(10)
        .attr("opacity", 0)
        .remove();

    images1 = g.append("svg:image")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("class", "groupimage")
        .attr("xlink:href", function(d) {
            if ((rdr(d).gname).includes("Segment E")) {
                return 'imgs/Others3.png'
            } else if ((rdr(d).gname).includes("Segment F")) {
                return 'imgs/tv-on2.png'
            }
        })
        .attr("x", "20")
        .attr("y", "-15")
        .attr("width", "30")
        .attr("height", "30")
        .attr("transform", function(d) {
            if ((rdr(d).gname).includes("Segment E") || (rdr(d).gname).includes("Segment F")) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (r0 + 66) + ")";
            } else {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (r0 + 26) + ")";
            }
        });

    var texts = g.select("text.label");

    texts.transition()
        .duration(10)
        .attr("opacity", 0)
        .remove();

    texts = g.append("svg:text")
        .attr("class", "label")
        .attr("dx", 4)
        .attr("dy", 15)
        .attr("text-anchor", "middle")
        .append("textPath")        
        .attr("xlink:href", function(d) {
            return "#group" + d.index;
        })
        .text(function(d) {
            return rdr(d).gname;
        })
        .style("fill", function(d) {
            return d3.rgb(fill(d.index)).darker(10);
        })
        .attr("startOffset", function(d) {
            var length = paths[0][d.index].getTotalLength();
            var outerRadius = 0;
            innerRadius = 0;
            if ((rdr(d).gname).includes("Segment E") || (rdr(d).gname).includes("Segment F")) {
                innerRadius = r0 * 1.03 + 50;
                outerRadius = r0 * 1.03 + 70;
            } else {
                innerRadius = r0 * 1.03;
                outerRadius = r0 * 1.03 + 20;
            }
            return (25 - (50 * outerRadius) / length + (50 * innerRadius) / length) + "%";
        });

    var chordPaths = svg.selectAll("path.chord")
        .data(chord.chords());

    chordPaths.enter().append("svg:path")
        .attr("class", "chord")
        .on("mouseover", function(d) {
            d3.select("#tooltip")
                .style("visibility", "visible")
                .html(chordTip(rdr(d)))
                .style("top", function() {
                    return (d3.event.pageY - 100) + "px"
                })
                .style("left", function() {
                    return (d3.event.pageX - 100) + "px";
                })
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip").style("visibility", "hidden");
        });

    chordPaths.transition()
        .duration(300)
        .attr("opacity", 0)
        .remove();

    chordPaths.transition()
        .duration(300)
        .style("fill", function(d) {
            return fillcolor(rdr(d.target).gname);
        })
        .attr("d", path);


    var cD = chord.groups();
    var groups = [{
        sIndex: 0,
        eIndex: 3,
        title: 'Super Segment',
        color: '#9327c9'
    }];

    for (var i = 0; i < groups.length; i++) {
        var __g = groups[i];
        var arc1 = d3.svg.arc()
            .innerRadius(r0 * 1.03 + 20 + (r0 * .03))
            .outerRadius(r0 * 1.03 + 20 + (r0 * .03) + 20)
            .startAngle(cD[__g.sIndex].startAngle)
            .endAngle(cD[__g.eIndex].endAngle);

        var paths1 = svg.select("path.supercat");

        paths1.transition()
            .duration(10)
            .attr("opacity", 0)
            .remove();

        paths1 = svg.append("svg:path").attr('fill', __g.color).attr('id', 'groupId' + i).attr("d", arc1).attr("class", "supercat");

        var texts1 = svg.select("text.label1");

        texts1.transition()
            .duration(10)
            .attr("opacity", 0)
            .remove();

        texts1 = svg.append("svg:text")
            .attr("dx", 4)
            .attr("dy", 15)
            .attr("text-anchor", "middle")
            .append("textPath")
            .attr("class", "label1")
            .attr("xlink:href", "#groupId" + i)
            .text(__g.title)
            .style("fill", '#ffffff')
            .attr("startOffset", function(d) {
                var length = paths1[0][i].getTotalLength();
                var outerRadius = r0 * 1.03 + 20 + (r0 * .03) + 20;
                innerRadius = r0 * 1.03 + 20 + (r0 * .03);
                return (25 - (50 * outerRadius) / length + (50 * innerRadius) / length) + "%";
            });
    }

    function chordTip(d) {
        var p = d3.format(".2%"),
            q = d3.format(",.3r")
        return "Chord Info:<br/>" + p(d.svalue / d.stotal) + " (" + q(d.svalue) + ") of " + d.sname + " go to " + d.tname + (d.sname === d.tname ? "" : ("<br/>while...<br/>" + p(d.tvalue / d.ttotal) + " (" + q(d.tvalue) + ") of " + d.tname + " go to " + d.sname))
    }

    function groupTip(d) {
        var p = d3.format(".1%"),
            q = d3.format(",.3r")
        return "Group Info:<br/>" + d.gname + " : " + q(d.gvalue) + "<br/>" + p(d.gvalue / d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
    }

    function mouseover(d, i) {
        d3.select("#tooltip")
            .style("visibility", "visible")
            .html(groupTip(rdr(d)))
            .style("top", function() {
                return (d3.event.pageY - 80) + "px"
            })
            .style("left", function() {
                return (d3.event.pageX - 130) + "px";
            })
    }

    //Returns an event handler for fading a given chord group.
    function fade(opacity) {
            return function(d, i) {
                if (opacity == .2) {
                    mouseover(d, i);
                } else {
                    d3.select("#tooltip").style("visibility", "hidden")
                }
                svg.selectAll("path.chord")
                    .filter(function(d) {
                        return d.source.index != i && d.target.index != i;
                    })
                    .transition()
                    .style("opacity", opacity);
            };
        } //fade  

}


//*******************************************************************
//  DRAW THE CHORD DIAGRAM
//*******************************************************************
function drawChords() {
    arc = d3.svg.arc()
        .innerRadius(function(d) {
            if ((rdr(d).gname).includes("Segment E") || (rdr(d).gname).includes("Segment F")) {
                return r0 * 1.03 + 50
            } else {
                return r0 * 1.03
            }
        })
        .outerRadius(function(d) {
            if ((rdr(d).gname).includes("Segment E") || (rdr(d).gname).includes("Segment F")) {
                return r0 * 1.03 + 70
            } else {
                return r0 * 1.03 + 20
            }
        });

    path = d3.svg.chord()
        .radius(function(d) {
            if ((rdr(d).gname).includes("Segment E") || (rdr(d).gname).includes("Segment F")) {
                return r0 + 50
            } else {
                return r0
            }
        });

    svg = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("id", "circle")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    updateChords();

    var totallegendlength = 0;
    var legend = svg.selectAll("g.legend")
        .data(chord.groups(),function(d,i){
            textbox = svg.append("svg:text").text(rdr(d).gname);
            bBox = textbox[0][0].getBBox();
            boxwidth = bBox.width + 20;
            textbox.remove();
            d.boxwidth = boxwidth;
            totallegendlength = totallegendlength + boxwidth +20;
            return i;
        })
        .enter().append("svg:g")
        .attr("class", "legend")

    length1 = -1 * (totallegendlength / 2) -20;
    oldlength = 0;

    legend.append("rect")
        .attr("x", function(d) {
            length1 = length1 + oldlength
            oldlength = d.boxwidth + 20;
            return length1;
        })
        .attr("y", -1 * (h / 2))
        .attr("width", function(d) {
            return d.boxwidth;
        })
        .attr("height", 30)
        .style("fill", function(d) {
            return fillcolor(rdr(d).gname);
        })
        .attr("rx", 4);;

    length1 = -1 * (totallegendlength / 2) -20 ;
    oldlength = 0;
    var addText = legend.append("text").attr("x", function(d, i) {
            length1 = length1 + oldlength
            oldlength = d.boxwidth + 20;
            return length1 + 10;
        })
        .attr("y", -1 * (h / 2) + 20)
        .text(function(d, i) {
            return rdr(d).gname;
        });


    d3.select('#slider2').call(
        d3.slider().scale(d3.scale.ordinal().domain(data3).rangePoints([0, 1], 0.5))
        .axis(d3.svg.axis()).snap(true).value(data2[0]).on("slideend", function(evt, value) { 
            var currindex = data3.indexOf(value);       
            newdata = globaldata.filter(function(d) {
                return d.Timeband == data2[currindex];
            });
            var mpr = chordMpr(newdata);

            mpr
                .addValuesToMap('Source')
                .setFilter(function(row, a, b) {
                    return (row.Source === a.name && row.Destination === b.name)
                })
                .setAccessor(function(recs, a, b) {
                    if (!recs[0]) return 0;
                    return +recs[0].Count;
                });

            matrix = mpr.getMatrix();
            mmap = mpr.getMap();
            sortData();
            updateChords();
        }));

}

function fillcolor(segmentvalue){
    if (segmentvalue.includes("Segment A")) {
        return '#ff3a21'
    } else if (segmentvalue.includes("Segment B")) {
        return '#26bde2'
    } else if (segmentvalue.includes("Segment D")) {
        return '#fcc30b'
    } else if (segmentvalue.includes("Segment C")) {
        return '#dd1367'
    } else if (segmentvalue.includes("Segment E")) {
        return '#a1e972'
    } else {
        return '#72e8a4'
    }
}