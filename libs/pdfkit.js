const PDFDocument = require('pdfkit');
const path = require("path");
const fs = require("fs");

const buildPDF = (data, tipo) => {
  const doc = new PDFDocument({ margin: 80, font: "Times-Roman" });
  // doc.on('data', dataCallback);
  // doc.on('end', endCallback);
  id = data.trabajador_id;
  const filePath = path.join(__dirname, "..", `${tipo}`, `${id}.pdf`);
  generateHeader(doc, data);
  const top = 180;
  doc.fontSize(15).text('CONSTANCIA DE ENTREGA Y LECTURA DE RESULTADOS DE EXAMEN MEDICO OCUPACIONAL', 80, top, { align: "center", width: 420 });
  doc.fontSize(12).text(`Yo, ${data.apellidoPaterno} ${data.apellidoMaterno} ${data.nombres}, identificado (a) con DNI Nº ${data.dni}, quien ocupa el cargo de: ${data.cargo} mediante el presente documento dejo constancia de haber recibido, de manera personalizada y por parte del médico ocupacional de la empresa el informe médico de los resultados del Examen Médico Ocupacional (EMO).`, 50, top + 50, { align: "justify", lineGap: 2 });
  doc.fontSize(12).text(`Que me fue realizado por mi empleador ${data.nombreEmpresa} en la fecha: ${data.fecha_examen} en la clínica ${data.clinica}.`, 50, top + 120, { align: "justify", lineGap: 2, margin: 30 });
  doc.fontSize(12).text('CONDICIÓN DE APTITUD:', 50, top + 160, {lineGap:2, margin: 30 } );
  
  doc.lineCap('butt')
  .moveTo(110, top + 190)
  .lineTo(110, top + 250)
  .stroke()
  
  data.condicion_aptitud === 'APTO' ? textInRowFirst(doc, 'X', top + 195, -5, 3) : ""
  data.condicion_aptitud === 'APTO CON RESTRICCIONES' ? textInRowFirst(doc, 'X', top + 215, -5, 3) : ""
  data.condicion_aptitud === 'NO APTO' ? textInRowFirst(doc, 'X', top + 235, -5, 3) : ""
  
  row(doc, top + 190);
  row(doc, top + 210);
  row(doc, top + 230)

  textInRowFirst(doc, 'APTO', top + 195, 100);
  textInRowFirst(doc, 'APTO CON RESTRICCIONES', top + 215, 100);
  textInRowFirst(doc, 'NO APTO', top + 235, 100);
  
  doc.fontSize(12).text(`Así mismo, he sido informado(a) sobre los hallazgos, se me ha indicado las recomendaciones y/o restricciones producto de dicho examen médico, además se me explicó cuáles son los principales riesgos laborales de mi puesto de trabajo y qué acciones debo tomar para disminuir su impacto en mi salud. Por otro lado, me comprometo a cumplir las recomendaciones brindadas por el Médico Ocupacional respecto a mi evaluación médica. Todo esto en cumplimiento de la normativa legal vigente en Seguridad y Salud en el Trabajo. (Ley 29783, DS 005-2012 TR Y RM Nº 312-2011-MINSA). Afirmo que la información contenida en el presente documento es real firmando la presente.`, 50, top + 270, { lineGap:2, margin: 30, align: 'justify' } );

  doc.fontSize(12).text('FIRMA DEL TRABAJADOR', 50, top + 470, { lineGap:2, margin: 30, align: 'left' })
  doc.fontSize(12).text(`DNI -- ${data.dni}`, 50, top + 490, { lineGap:2, margin: 30, align: 'left' })

  doc.lineWidth(1);

  doc.lineCap('butt')
    .moveTo(200, top + 460)
    .lineTo(50, top + 460)
    .stroke();

	// generateFooter(doc);
  doc.end();
  doc.pipe(fs.createWriteStream(filePath));
}

function generateHeader(doc, data) {
	doc.fillColor('#444444')
		.fontSize(20)
		.text(data.nombreEmpresa, 50, 120, { align: 'right' })
		.fontSize(10)
		.moveDown();
}

function generateFooter(doc) {
	doc.fontSize(
		10,
	).text(
		'Payment is due within 15 days. Thank you for your business.',
		50,
		780,
		{ align: 'center', width: 500 },
	);
}

function textInRowFirst(doc, text, heigth, width, columns = 2, align = 'center') {
  doc.y = heigth;
  doc.x = width;
  doc.fillColor('black')
  doc.text(text, {
    paragraphGap: 5,
    indent: 5,
    align: align,
    columns: columns,
  });
  return doc
}

function row(doc, heigth) {
  doc.lineJoin('miter')
    .rect(50, heigth, 250, 20)
    .stroke()
  return doc
}

module.exports = buildPDF;