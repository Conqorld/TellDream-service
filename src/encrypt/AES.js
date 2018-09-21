const CryptoJS = require("crypto-js");
let key = '0123456789abcdef'
let iv = '0123456789abcdef'

key = CryptoJS.enc.Utf8.parse(key);
iv = CryptoJS.enc.Utf8.parse(iv);

class encrypt {
  encryptedAES (str) {
    let encrypted = CryptoJS.AES.encrypt(str, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    encrypted = encrypted.toString();
    
    return encrypted
  }
  
  decryptedAES(token) {
    let decrypted = CryptoJS.AES.decrypt(token, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  
    decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
    
    return decrypted
  }
}

module.exports = new encrypt()