const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79';
const LOCATION_ID = 'AAzBZNLXS4rdwhG76MLi';
const fieldId = 'Oy4NbiWhcxoV3IOlq9Ar'; // VOIL Gallery 2198

// 1. Create photo
const photoPath = path.join('/tmp', 'test-ghl-photo2.jpg');
const blankJpegHex = 'FFD8FFE000104A46494600010101004800480000FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C180D0D1832211C213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232FFC0001108000A000A03012200021101031101FFC4001F0000010501010101010100000000000000000102030405060708090A0BFFC400B5100002010303020403050504040000017D01020300041105122131410613516107227114328191A1082342B1C11552D1F02433627282090A161718191A25262728292A3435363738393A434445464748494A535455565758595A636465666768696A737475767778797A838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE1E2E3E4E5E6E7E8E9EAF1F2F3F4F5F6F7F8F9FAFFC4001F0100030101010101010101010000000000000102030405060708090A0BFFC400B51100020102040403040705040400010277000102031104052131061241510761711322328108144291A1B1C109233352F0156272D10A162434E125F11718191A262728292A35363738393A434445464748494A535455565758595A636465666768696A737475767778797A82838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE2E3E4E5E6E7E8E9EAF2F3F4F5F6F7F8F9FAFFDA000C03010002110311003F00F928A28A00FFD9';
fs.writeFileSync(photoPath, Buffer.from(blankJpegHex, 'hex'));

async function run() {
    // 2. Create contact FIRST
    const createCmd = `curl -s -X POST "https://services.leadconnectorhq.com/contacts/" -H "Authorization: Bearer ${API_KEY}" -H "Version: 2021-07-28" -H "Content-Type: application/json" -d '{"locationId":"${LOCATION_ID}","email":"test-contact-id@example.com","firstName":"ContactID","lastName":"Test"}'`;
    const createResult = JSON.parse(execSync(createCmd).toString());
    const contactId = createResult.contact.id;
    console.log('Created contact:', contactId);

    // 3. Upload photo using CONTACT ID
    const uniqueId = Date.now().toString();
    const uploadCmd = `curl -s -X POST "https://services.leadconnectorhq.com/locations/${LOCATION_ID}/customFields/upload" -H "Authorization: Bearer ${API_KEY}" -H "Version: 2021-07-28" -F "id=${contactId}" -F "maxFiles=10" -F "${fieldId}_${uniqueId}=@${photoPath}"`;
    const uploadResult = JSON.parse(execSync(uploadCmd).toString());
    const uploadedUrl = Object.values(uploadResult.uploadedFiles)[0] || uploadResult.meta[0]?.url;
    console.log('Uploaded to URL:', uploadedUrl);

    // 4. Update contact with URL
    const updateCmd = `curl -s -X PUT "https://services.leadconnectorhq.com/contacts/${contactId}" -H "Authorization: Bearer ${API_KEY}" -H "Version: 2021-07-28" -H "Content-Type: application/json" -d '{"customFields":[{"id":"${fieldId}","value":["${uploadedUrl}"]}]}'`;
    const updateResult = JSON.parse(execSync(updateCmd).toString());
    
    console.log('Update result:', updateResult.contact.customFields.find(f => f.id === fieldId));
    console.log('\nContact URL:', `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/contacts/detail/${contactId}`);
}

run();
