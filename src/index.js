import _ from 'lodash';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import download from "downloadjs";


function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

async function createPdf() {
  const pdfDoc = await PDFDocument.create()
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  const fontSize = 30
  page.drawText('Creating PDFs in JavaScript is awesome!', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  })

  const pdfBytes = await pdfDoc.save()
  download(pdfBytes, "pdf-lib_creation_example.pdf", "application/pdf");
}

console.log("hello")
document.body.appendChild(component());
let input = document.createElement("input");
input.type = "file"
input.id = "pdf-upload"
document.body.appendChild(input)


let btn = document.createElement("button");
btn.innerHTML = "Click Me";
document.body.appendChild(btn);
btn.onclick = function() {
  console.log("hello");
  createPdf();
};

document.querySelector("#pdf-upload").addEventListener("change", function(e){
  var canvasElement = document.querySelector("canvas")
  var file = e.target.files[0]
  if(file.type != "application/pdf"){
    console.error(file.name, "is not a pdf file.")
    return
  }

  var fileReader = new FileReader();

  fileReader.onload = async function() {
    var pdfBytes = new Uint8Array(this.result);
    const usConstitutionPdf = await PDFDocument.load(pdfBytes);

    const pdfOutBytes = await usConstitutionPdf.save();

    download(pdfOutBytes, "pdf-upload.pdf", "application/pdf");
  };

  fileReader.readAsArrayBuffer(file);
})


async function embedPdfPages() {
  const flagUrl = 'https://pdf-lib.js.org/assets/american_flag.pdf';
  const constitutionUrl = 'https://pdf-lib.js.org/assets/us_constitution.pdf';

  const flagPdfBytes = await fetch(flagUrl).then((res) => res.arrayBuffer());
  const constitutionPdfBytes = await fetch(constitutionUrl).then((res) =>
      res.arrayBuffer(),
  );

  const pdfDoc = await PDFDocument.create();

  const [americanFlag] = await pdfDoc.embedPdf(flagPdfBytes);

  const usConstitutionPdf = await PDFDocument.load(constitutionPdfBytes);
  const preamble = await pdfDoc.embedPage(usConstitutionPdf.getPages()[1], {
    left: 55,
    bottom: 485,
    right: 300,
    top: 575,
  });

  const americanFlagDims = americanFlag.scale(0.3);
  const preambleDims = preamble.scale(2.25);

  const page = pdfDoc.addPage();

  page.drawPage(americanFlag, {
    ...americanFlagDims,
    x: page.getWidth() / 2 - americanFlagDims.width / 2,
    y: page.getHeight() - americanFlagDims.height - 150,
  });
  page.drawPage(preamble, {
    ...preambleDims,
    x: page.getWidth() / 2 - preambleDims.width / 2,
    y: page.getHeight() / 2 - preambleDims.height / 2 - 50,
  });

  const pdfBytes = await pdfDoc.save();
}