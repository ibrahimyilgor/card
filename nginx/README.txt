Place your SSL certificate as cert.pem and your private key as key.pem in this folder.

For production, use certificates from Let's Encrypt or a trusted CA.
For testing, you can generate a self-signed certificate with:

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=yourdomain.com"
