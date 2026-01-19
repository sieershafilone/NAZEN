const PDFDocument = require('pdfkit');
const config = require('../config');
const { formatDateIndian, formatCurrency } = require('./helpers');

// Generate GST Invoice PDF
const generateInvoicePDF = (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const {
                invoiceNumber,
                invoiceDate,
                gymName,
                gymAddress,
                gymPhone,
                gymGstin,
                memberName,
                memberPhone,
                memberId,
                planName,
                planDuration,
                baseAmount,
                gstPercent,
                gstAmount,
                totalAmount,
                paymentMethod,
                paymentDate,
            } = invoiceData;

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text(gymName, { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(gymAddress, { align: 'center' });
            doc.text(`Phone: ${gymPhone}`, { align: 'center' });
            if (gymGstin) {
                doc.text(`GSTIN: ${gymGstin}`, { align: 'center' });
            }

            doc.moveDown(2);

            // Invoice Title
            doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
            doc.moveDown();

            // Invoice Details
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice Number: ${invoiceNumber}`);
            doc.text(`Invoice Date: ${formatDateIndian(invoiceDate)}`);

            doc.moveDown();

            // Member Details
            doc.font('Helvetica-Bold').text('Bill To:');
            doc.font('Helvetica');
            doc.text(`Name: ${memberName}`);
            doc.text(`Member ID: ${memberId}`);
            doc.text(`Phone: ${memberPhone}`);

            doc.moveDown();

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            doc.font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Duration', 250, tableTop);
            doc.text('Amount', 450, tableTop, { align: 'right' });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Table Content
            doc.font('Helvetica');
            const itemY = doc.y;
            doc.text(`${planName} - Gym Membership`, 50, itemY);
            doc.text(`${planDuration} Days`, 250, itemY);
            doc.text(formatCurrency(baseAmount), 450, itemY, { align: 'right' });

            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Totals
            const totalsX = 350;
            doc.text('Subtotal:', totalsX);
            doc.text(formatCurrency(baseAmount), 450, doc.y - 12, { align: 'right' });

            doc.moveDown(0.5);
            doc.text(`GST (${gstPercent}%):`, totalsX);
            doc.text(formatCurrency(gstAmount), 450, doc.y - 12, { align: 'right' });

            doc.moveDown(0.5);
            doc.moveTo(totalsX, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica-Bold');
            doc.text('Total:', totalsX);
            doc.text(formatCurrency(totalAmount), 450, doc.y - 12, { align: 'right' });

            doc.moveDown(2);

            // Payment Info
            doc.font('Helvetica');
            doc.text(`Payment Method: ${paymentMethod}`);
            doc.text(`Payment Date: ${formatDateIndian(paymentDate)}`);
            doc.text('Payment Status: PAID', { continued: false });

            doc.moveDown(3);

            // Footer
            doc.fontSize(8).text('This is a computer-generated invoice and does not require a signature.', { align: 'center' });
            doc.text('Thank you for choosing ' + gymName + '!', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
