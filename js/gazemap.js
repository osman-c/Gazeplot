let flag = true;
let speed = 100;
let noise = 60;
let size = 1;
let lineWidth = 4;
let strokeOpacity = 1;
let firstColor = "blue";
let secondColor = "red";
let numbersVisible = "hidden";
let data = null;
let svg = null;
let tooltip = null;
let slider = null;
let sliderText = null;
let circles = null;
let lines = null;
let numbers = null;        
let users = [];       

//commented to use dummy data

//let experimentGuid = getParameterByName("ExperimentGuid");
//let experimentItemGuid = getParameterByName("ExperimentItemGuid");
//let fileGuid = getParameterByName("FileGuid");
//let analysisGuids = [];
//let url = getImageURL("https://s3-eu-west-1.amazonaws.com/neurolize-assets-ireland/" + experimentGuid + "/Assets/" + fileGuid);
//
//for (var i = 0; i < getParameterByName("AnalysisGuids").split(" ").length; i++) {
//	if (getParameterByName("AnalysisGuids").split(" ")[i] != "") {
//		analysisGuids.push(getParameterByName("AnalysisGuids").split(" ")[i]);
//	}
//}
//                                                                
//let jsn = {                                                     
//    "ItemGuid" : experimentItemGuid,        					
//    "AnalysisGuids" : analysisGuids
//};                              
//
//let rawData = InitGazemap();  //datayı çek

let rawData = [user1, user2];
users = [user1name, user2name];
let analysis = $('#analysisform');

let img = new Image();
img.src = url;

img.addEventListener('load', function() {   
    if(flag === false)
        return;    
                                                                //herşey resim yüklenince başlıyor
    for(let i = 0; i < users.length; i++){          //bu fonksiyon her analysisguid için bir radio button ekliyor, içeriği değiştirilebilir
        AddOption(analysis, users[i], i);
    }

    data = rawData[0].data;
    $("#0").prop("checked", true);                              //default olarak 0 seç

    svg = d3.select('#svg')
        .attr('viewBox', "0 0 " + img.width + " " + img.height)
        .attr('preserveAspectRatio', 'none');

    svg.append("image")
        .attr('href', url)
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('id', "image");
    
    //let radius = (img.height + img.width) / 40;
    //data = SummarizeData(data2, radius, noise);               //bu fonksiyon datayı özetlemek için, ama bunu arka tarafta yapmamız lazım diye 
                                                                //öyle bıraktım, bundan sonra herşey sliderlara event ekle, plotla, animasyon vsvs
    slider = d3.select('#slider')
        .attr('max', data.length);
        //.attr('value', data.length)

    tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    CreatePlot(svg);
    
    let jslider = $('#slider');
    sliderText = $('#sliderText');

    let rslider = $('#rslider');
    rslider.val(size);
    rslider.on('input', function () {
        ChangeSize(rslider.val());
    });
    
    let wslider = $('#wslider');
    wslider.val(lineWidth);
    wslider.on('input', function () {
        ChangeWidth(wslider.val().toString() + "px");
    });

    let oslider = $('#oslider');
    oslider.val(100);
    oslider.on('input', function () {
        ChangeOpacity(oslider.val().toString() + "%");
    });
    
    let showNumbers = $('#numbers');
    showNumbers.on('input', function () {
        ChangeNumbers(showNumbers.is(':checked'));
    });

    let color1 = $('#color1');
    let color2 = $('#color2');
    
    color1.on('input', function () {
        ChangeColor(color1.val(), color2.val());
    });
    
    color2.on('input', function () {
        ChangeColor(color1.val(), color2.val());
    });
    
    jslider.on('input', function () {
        sliderText.html(jslider.val());
        DrawPlot(jslider.val(), showNumbers.is(':checked'));
    });
    
    $(window).keydown(function (event) {
        if (event.key === "a" || event.key === "ArrowLeft"){
            jslider.val( +jslider.val() - 1);
            sliderText.html(jslider.val());
            DrawPlot(jslider.val(), showNumbers.is(':checked'));
        }
        else if (event.key === "d" || event.key === "ArrowRight"){
            jslider.val( +jslider.val() + 1);
            sliderText.html(jslider.val());
            DrawPlot(jslider.val(), showNumbers.is(':checked'));
        }
    });
});

function ChangeColor(color1, color2){
    var myColor = d3.scale.linear().domain([1,data.length])
        .range([color1, color2]);

    circles.attr("stroke", function(d, i) { return myColor(i);})
        .attr("fill", function(d, i) { return myColor(i);});

    lines.attr("stroke", function(d, i) { return myColor(i);});

    numbers.style("fill", function(d, i) { return myColor(i);});
    
    firstColor = color1;
    secondColor = color2;
}

function ChangeSize(s){
    circles.data(data)
        .attr("r", function(d) { return d.Duration / 1000 * s; });
    
    numbers.data(data)
        .attr("dy", function (d) { return (-d.Duration/1000*size - 2)})
    
    size = s;
}

function ChangeWidth(w){
    lines.attr("stroke-width", w);
    lineWidth = w;
}

function ChangeOpacity(opacity){
    lines.attr("stroke-opacity", opacity);
    strokeOpacity = opacity;
}

function ChangeNumbers(bool){
    if (bool){
        numbers.style("visibility", "visible");
        numbersVisible = "visible";
    }
    else{
        numbers.style("visibility", "hidden");
        numbersVisible = "hidden";
    }
}

function SummarizeData(data, radius, noise){
    let tempX = data[0].X;
    let tempY = data[0].Y;
    let tempTime = data[0].Timestamp;
    let tempDur = data[0].Duration;
    let array = [];
    for (let i = 1; i < data.length; i++){
        if((Math.pow(data[i].X - tempX, 2) + Math.pow(data[i].Y - tempY, 2)) < Math.pow(radius, 2)) {
            tempDur += data[i].Duration;
            if(i === data.length){
                array.push({
                    X: tempX,
                    Y: tempY,
                    Timestamp: tempTime,
                    Duration: tempDur
                });
            }
        }
        else{
            if(tempDur>noise){
                array.push({
                    X: tempX,
                    Y: tempY,
                    Timestamp: tempTime,
                    Duration: tempDur
                });
            }
            tempX = data[i].X;
            tempY = data[i].Y;
            tempTime = data[i].Timestamp;
            tempDur = data[i].Duration;
        }
    }
    return array;
}

function InitGazemap() {
    let aa = { data: [], sample_rate: 0, scale: {} };
    let dd = [];
    for(let i = 0; i < jsn.AnalysisGuids.length; i++){
        dd.push(JSON.parse(JSON.stringify(aa)));
    }
    
    $.ajax({
        type: "POST",
        url: "https://cors.mertsarac.workers.dev/?https%3A%2F%2Fmanage.neurolize.com%2FGazemapHandlerV2.ashx",
        data: JSON.stringify(jsn),
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (dataResponse, success) {
            for(let i = 0; i < dataResponse.length; i++){
                users.push(dataResponse[i].ParticipantName)
            }
            for(let i = 0; i < jsn.AnalysisGuids.length; i++){
                dd[i].data = dataResponse[i].GazeMapData;
                dd[i].sample_rate = dataResponse[i].SampleRate;
                dd[i].scale = dataResponse[i].Scale;
            }
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
    return dd;
}

function AddOption(list, label, value){
    let input = $('<input>').attr('type', 'radio');
    input.attr('id', value);
    input.attr('value', value);
    input.attr('name', 'analysis');
    let lbl = $('<label></label>').attr('for', value);
    lbl.html(label);
    list.append(input);
    list.append(lbl);
    list.append("<br>");
    input.on( "click", function() {
       let val = $( "input:checked" ).val();
       data = rawData[val].data;
       d3.selectAll('g').remove();
       d3.selectAll('line').remove();
       slider = d3.select('#slider')
            .attr('max', data.length);
       CreatePlot(svg);
    });
}

function CreatePlot(svg){
    var myColor = d3.scale.linear().domain([1,data.length])
        .range([firstColor, secondColor]);

    var elem = svg.selectAll("g")
        .data(data)
    
    var elemEnter = elem.enter()
        .append("g")
        .attr("transform", function(d){return "translate("+ d.X/100000 + " " + d.Y/100000 + ")"})

    circles = elemEnter.append("circle")
        .attr("r", 0)
        .style("stroke-width", 1)
        .style("fill-opacity", 0.15)
        .attr("stroke", function(d, i) { return myColor(i);})
        .attr("fill", function(d, i) { return myColor(i);})
        .on("mouseover", function(d, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill-opacity", 0.95)
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html("Index: " + i + "<br/>" +
                "X: " + d.X + "<br/>" + 
                "Y: " + d.Y + "<br/>" + 
                "Timestamp: " + d.Timestamp + "<br/>" +
                "Duration: " + d.Duration)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(500)
                .style("fill-opacity", 0.15)
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    numbers = elemEnter.append("text")
        .text(function(d, i){return i})
        //.attr("dy", function (d) { return (d.Duration/1000*size)*Math.SQRT2/2+1})
        //.attr("dx", function (d) { return (d.Duration/1000*size)*Math.SQRT2/2+1})
        .attr("dy", function (d) { return (-d.Duration/1000*size - 2)})
        .attr("text-anchor", "middle")
        .style("fill", function(d, i) { return myColor(i);})
        .attr("font-size", "25px")
        .style("visibility", numbersVisible);

    lines = svg.selectAll("line")
        .data(data)
        .enter().append("line")
        .attr("x1", function(d) { return d.X/100000; })
        .attr("x2", function(d) { return d.X/100000; })
        .attr("y1", function(d) { return d.Y/100000; })
        .attr("y2", function(d) { return d.Y/100000; })
        .attr("class", "line")
        .attr("stroke", function(d, i) { return myColor(i);})
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-width", lineWidth);
    lines[0].pop();
    
    circles.transition()
        .duration(function (d) { return speed; })
        .delay(function(d, i) { return i*speed; })
        .attr("r", function(d) { return d.Duration/1000 * size; })
        .each("start", function (d, i) {
            sliderText.html(i+1);
        })
        .each("interrupt", function (d) {
            circles.attr("r", function(d) { return d.Duration/1000 * size; })
        });

    lines.transition()
        .duration(function (d) { return speed; })
        .delay(function(d, i) { return i*speed; })
        .attr("x2", function(d, i) { return data[i+1]?.X/100000; })
        .attr("y2", function(d, i) { return data[i+1]?.Y/100000; })
        .each("interrupt", function (d) {
            lines.attr("x2", function(d, i) { return data[i+1]?.X/100000; })
                .attr("y2", function(d, i) { return data[i+1]?.Y/100000; });
    });
    
    slider.transition()
        .duration(speed * data.length)
        .attr("value", data.length)
        .call(function (t){
            d3.select("#sliderText")
                .text(t);
        })
}

function DrawPlot(length, v){
    circles.transition();
    lines.transition();
    slider.transition();
    circles.attr("visibility", function (d, i) { return Treshold(i, length)});
    if (v){
        numbers.style("visibility", function (d, i) { return Treshold(i, length)});
    }
    lines.attr("visibility", function (d, i) { return Treshold(i, length-1)});
}

function Treshold(index, length){
    if (length > index){
        return "visible";
    }
    else {
        return "hidden";
    }
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function fixCors(url) {
    var parts = url.split("/");
    parts[2] = parts[3] + '.' + parts[2];
    parts.splice(3, 1);

    return parts.join('/');
}

function ExportWithCanvas(img1Src, img2Src) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var imageObj1 = new Image();
    imageObj1.setAttribute('crossOrigin', 'anonymous');
    var imageObj2 = new Image();
    imageObj2.setAttribute('crossOrigin', 'anonymous');
    imageObj1.src = fixCors(img1Src);

    imageObj1.onload = function () {
        ctx.drawImage(imageObj1, 0, 0, 1920, 1080);
        imageObj2.src = img2Src;
        imageObj2.onload = function () {
            ctx.drawImage(imageObj2, 0, 0, 1920, 1080);

            var tempDataUrl = c.toDataURL();
            downloadURI(tempDataUrl, "EyeTracking.png");
        }
    };
}

function Download() {
    d3.select('#image').attr('style', 'display: none;')
    var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
    var DOMURL = self.URL || self.webkitURL || self;
    var svg1 = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var src = DOMURL.createObjectURL(svg1);
    ExportWithCanvas(url, src)
    d3.select('#image').attr('style', 'display: visible;')
}