


function writeMessage() {
    // fill with white
    textImageCtx.fillStyle = 'white';
    textImageCtx.fillRect(0, 0, textImageCanvas.width, textImageCanvas.height);
    //// write message
    // lineheight = 100;
    // textImageCtx.font = lineheight + 'px ComicSansMS';
    // textImageCtx.fillStyle = 'black';
    // var words = message.value.split('\n');
    // for (var i = 0; i < lines.length; i++) {
    //     textImageCtx.fillText(lines[i], 0, (i + 1) * lineheight);
    // }
    // write message
    lineheight = 100;
    textImageCtx.font = lineheight + 'px ComicSansMS';
    textImageCtx.fillStyle = 'black';
    var words = message.value.split(' ');
    var lines = [];
    var line = '';
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var testWidth = testLine.length * (lineheight * 0.425);
        if (testWidth > textImageCanvas.width && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    for (var i = 0; i < lines.length; i++) {
        textImageCtx.fillText(lines[i], 0, (i + 1) * lineheight);
    }
}




function drawCodedImage() {
    textImageCtx.drawImage(this, 0, 0, textImageCanvas.width, textImageCanvas.height);
}

function drawInputImage() {
    inputImageCanvas.width = this.width;
    inputImageCanvas.height = this.height;
    inputImageCtx.drawImage(this, 0, 0);
    outputImageCanvas.width = this.width;
    outputImageCanvas.height = this.height;
    textImageCanvas.width = this.width;
    textImageCanvas.height = this.height;
    if (message.value != '') {
        writeMessage();
    } else if (document.getElementById('codedImageFile').files.length > 0) {
        var img = new Image();
        img.onload = drawCodedImage;
        img.src = URL.createObjectURL(document.getElementById('codedImageFile').files[0]);
        textImageCtx.fillStyle = 'white';
        textImageCtx.fillRect(0, 0, textImageCanvas.width, textImageCanvas.height);
    }
}



function hide() {
    var textImagePixels = textImageCtx.getImageData(0, 0, textImageCanvas.width, textImageCanvas.height)
    var inputImagePixels = inputImageCtx.getImageData(0, 0, inputImageCanvas.width, inputImageCanvas.height)
    var outputImagePixels = inputImageCtx.getImageData(0, 0, outputImageCanvas.width, outputImageCanvas.height)
    for (var i = 0; i < outputImagePixels.data.length; i += 4) {
        outputImagePixels.data[i] = (inputImagePixels.data[i] & 0xFE) | ((textImagePixels.data[i] >> 7) & 1);
    }
    outputImageCtx.putImageData(outputImagePixels, 0, 0);
}
function downloadOutputImage() {
    var link = document.createElement('a');
    link.download = 'encoded.png';
    link.href = document.getElementById('outputImageCanvas').toDataURL()
    link.click();
}
function downloadTextImage() {
    var link = document.createElement('a');
    link.download = 'text.png';
    link.href = document.getElementById('textImageCanvas').toDataURL()
    link.click();
}

async function generateFromPrompt() {
  generateButton.disabled = true;
  var url = await generateImage(prompt.value);
  // var url = "https://replicate.delivery/xezq/6pY3fI1kaySeAk1fGb38WpdDLwsBzGwjaYa59PYrvXdfvLjQB/out-0.webp";
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  img.onload = drawInputImage;
}
var data;
async function generateImage(txt) {
  generateButton.disabled = true;
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + token.value);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Prefer", "wait");

  var raw = JSON.stringify({
    version: "b761fa16918356ee07f31fad9b0d41d8919b9ff08f999e2d298a5a35b672f47e",
    input: {
      model: "dev",
      prompt: txt,
      go_fast: false,
      lora_scale: 1,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "webp",
      guidance_scale: 3.5,
      output_quality: 80,
      prompt_strength: 0.8,
      extra_lora_scale: 0.8,
      num_inference_steps: 28,
    },
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  var response = await fetch(
    "https://api.replicate.com/v1/predictions",
    requestOptions
  );
  data = await response.json();
  var link = data.output[0];
  // console.log(data);
  return link;
}
