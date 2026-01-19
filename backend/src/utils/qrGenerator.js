const QRCode = require('qrcode');

// Generate QR code for member check-in
const generateMemberQR = async (memberId, memberUUID) => {
    const qrData = JSON.stringify({
        type: 'NAZEN_CHECKIN',
        memberId,
        uuid: memberUUID,
        timestamp: Date.now(),
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });

    return qrCodeDataURL;
};

// Generate QR code as buffer
const generateMemberQRBuffer = async (memberId, memberUUID) => {
    const qrData = JSON.stringify({
        type: 'NAZEN_CHECKIN',
        memberId,
        uuid: memberUUID,
    });

    const buffer = await QRCode.toBuffer(qrData, {
        width: 300,
        margin: 2,
    });

    return buffer;
};

// Parse QR code data
const parseQRData = (qrString) => {
    try {
        const data = JSON.parse(qrString);
        if (data.type !== 'NAZEN_CHECKIN') {
            throw new Error('Invalid QR code type');
        }
        return data;
    } catch (error) {
        throw new Error('Invalid QR code format');
    }
};

module.exports = {
    generateMemberQR,
    generateMemberQRBuffer,
    parseQRData,
};
