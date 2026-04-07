// Vercel Serverless Function — Facebook Data Deletion Callback
// https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback

const crypto = require('crypto');

function parseSignedRequest(signedRequest, secret) {
  const [encodedSig, payload] = signedRequest.split('.');
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest();
  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Invalid signature');
  }
  return data;
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const confirmationCode = 'DEL-' + Date.now().toString(36).toUpperCase();
    const statusUrl = 'https://nautitour-lp.vercel.app/portal/exclusao-dados.html';

    // Facebook espera esta resposta JSON
    return res.status(200).json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });
  } catch (err) {
    return res.status(200).json({
      url: 'https://nautitour-lp.vercel.app/portal/exclusao-dados.html',
      confirmation_code: 'DEL-ERROR'
    });
  }
};
