console.log('Loaded Extension');
var applied = false;
$("#contentPane").bind("DOMSubtreeModified", function() {
    var shareElements = $('div.Ql td.n-Ja-e-A');
    console.log("Found Elements1: " + $("div.Ql td.n-Ja-e-A").length);
    console.log("Found Elements2: " + shareElements.length);
    
    if(shareElements.length == 1 && !applied)
    {
        applied = true;
        shareElements.click( function() {
            alert("hi");
        });
    }
       

    //console.log("Found Elements1: " + $("div.Ql div.tk3N6e-e-qc").length);
    //$("div.tk3N6e-e-qc").css("border","3px solid red");

});

