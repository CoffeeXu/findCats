function $(id)
{
    return document.getElementById(id);
}
var viewer = $("viewer");
var preCanvas = $("preview");

viewer.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();

    viewer.style.border='5px dashed #555';
    return false;
})

viewer.addEventListener('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();

    viewer.style.border='4px dashed #ccc';
    return false;
});  

viewer.addEventListener("drop",function(e){  
     e.stopPropagation();   
     e.preventDefault();    
  
     var dt = e.dataTransfer; 
     viewer.style.border='4px dashed #ccc';   
  
     //获取文件数组  
     var files = dt.files;  
     handleFile(files);   
},false);  
  
/*FileReader预览图片*/
function handleFile(file){ 
    var fileName = $("fileName");
    fileName.value = file[0].name;
    if (file[0].type.indexOf("image") == 0) { 
        if(file[0].size >= 512000){
            alert("图片"+file[0].name+"过大，无法处理。拿个<500k的试试吧");
        }else{
            var reader = new FileReader();  
            reader.onload = function(e)
            {
                displayImage(e.target.result);//displayImage(container,dataURL)
            }
            reader.readAsDataURL(file[0]); 
        }
    }else{
        alert("ooop! "+file[0].name+"不是图片"); 
    }         
}

function displayImage(dataURL){ 
    var cxt = preCanvas.getContext("2d");   
    var img = new Image();  
    
    img.onload = function(){
        var w = img.width, h = img.height;
        preCanvas.width = w; 
        preCanvas.height = h;
        viewer.style.width = w+"px";
        viewer.style.height = h+"px";
        $("droparea-text").style.display = "none";
        
        cxt.drawImage(img, 0, 0);
    }
    img.src = dataURL;
}
$("grey").addEventListener('click', function() {
    greying(preCanvas);
    return false;
});
$("hog").addEventListener('click', function() {
    drawGradient(preCanvas, 'x');
    return false;
});
$("binary").addEventListener('click', function() {   
    binary( greying(preCanvas) );
    return false;
});
//绘制图像
function drawImage(container,data)
{
    var ctxt = container.getContext('2d');
    var imagedata = ctxt.getImageData(0, 0, container.width, container.height);

    for (var y = 0; y < imagedata.height; y++) {
      for (var x = 0; x < imagedata.width; x++) {
        var i = (y * 4) * imagedata.width + x * 4;
        var luma = data[y][x] * 255;

        imagedata.data[i] = luma;
        imagedata.data[i + 1] = luma;
        imagedata.data[i + 2] = luma;
        imagedata.data[i + 3] = 255;
      }
    }
    ctxt.putImageData(imagedata, 0, 0, 0, 0, imagedata.width, imagedata.height);

}
function greying(canvas) 
{
    if(!canvas.data)
    {
        var ctx = canvas.getContext('2d');
        var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    //获取greys灰度数据
    var greys = new Array(imagedata.height);
    for (var y = 0, leny = imagedata.height; y < leny; y++) {

        greys[y] = new Array(imagedata.width);
        for (var x = 0, lenx = imagedata.width; x < lenx; x++) {
            var i = x*4 + y*4*lenx;
            var r = imagedata.data[i],
                g = imagedata.data[i+1],
                b = imagedata.data[i+2],
                a = imagedata.data[i+3];
            greys[y][x] = a == 0 ? 1 : (r*.299 + g*.587 + b*.114)/255;
        }; 
    };
    //画到页面上呈现putImageData
    drawImage(canvas, greys);
    alert(greys);
    return greys;    
}


function gradients(canvas)
{
    var greys = greying(canvas);
    return this._gradients(greys);
}

function  _gradients(intensities) {
    var height = intensities.length;
    var width = intensities[0].length;

    var gradX = new Array(height);
    var gradY = new Array(height);

    for (var y = 0; y < height; y++) {
      gradX[y] = new Array(width);
      gradY[y] = new Array(width);

      var row = intensities[y];

      for (var x = 0; x < width; x++) {
        var prevX = x == 0 ? 0 : intensities[y][x - 1];
        var nextX = x == width - 1 ? 0 : intensities[y][x + 1];
        var prevY = y == 0 ? 0 : intensities[y - 1][x];
        var nextY = y == height - 1 ? 0 : intensities[y + 1][x];

        // kernel [-1, 0, 1]
        gradX[y][x] = -prevX + nextX;
        gradY[y][x] = -prevY + nextY;
      }
    }

    //console.log(gradX[0]);
    return {
      x: gradX,
      y: gradY
    };
  }
function  drawGradient(canvas, dir) {
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var gradients = this.gradients(canvas);
    var grads = gradients[dir || "x"];

    for (var y = 0; y < imageData.height; y++) {
      for (var x = 0; x < imageData.width; x++) {
        var i = (y * 4) * imageData.width + x * 4;
        var grad = Math.abs(grads[y][x]) * 255;

        imageData.data[i] = grad;
        imageData.data[i + 1] = grad;
        imageData.data[i + 2] = grad;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
    return canvas;
  }
function binary(greys) 
{
    //获取greys灰度数据
    for (var y = 0, leny = greys[0].length; y < leny; y++) {

        for (var x = 0, lenx = greys.length; x < lenx; x++) {
            var all = 0;
            all += greys[y][x];
        }; 
    };
    var avg = all/(leny*lenx);
    console.log(avg);  
}

