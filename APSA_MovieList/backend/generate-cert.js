const fs = require('fs');
const path = require('path');
const pki = require('node-forge').pki;

const sslDir = path.join(__dirname, 'ssl');

// Ensure ssl directory exists
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

const keyPath = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');

try {
  // Remove old files if they exist
  if (fs.existsSync(keyPath)) {
    fs.unlinkSync(keyPath);
    console.log('Removed old key.pem');
  }
  if (fs.existsSync(certPath)) {
    fs.unlinkSync(certPath);
    console.log('Removed old cert.pem');
  }
  
  console.log('Generating self-signed certificate for localhost...');
  
  // Generate key pair
  const keys = pki.rsa.generateKeyPair(2048);
  
  // Create certificate
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
  
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'organizationName', value: 'Development' },
    { name: 'countryName', value: 'BR' }
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2,
          value: 'localhost'
        },
        {
          type: 7,
          ip: '127.0.0.1'
        }
      ]
    }
  ]);
  
  // Self-sign certificate
  cert.sign(keys.privateKey, null);
  
  // Convert to PEM
  const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
  const certPem = pki.certificateToPem(cert);
  
  // Write files
  fs.writeFileSync(keyPath, privateKeyPem);
  fs.writeFileSync(certPath, certPem);
  
  console.log('✅ Certificate generated successfully!');
  console.log(`📁 Key saved to: ${keyPath}`);
  console.log(`📁 Cert saved to: ${certPath}`);
  console.log('\nYou can now run: npm run dev');
} catch (error) {
  console.error('❌ Error generating certificate:', error.message);
  process.exit(1);
}
