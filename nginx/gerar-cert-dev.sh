#!/bin/sh
# Gera certificado TLS self-signed para desenvolvimento local
# Uso: sh nginx/gerar-cert-dev.sh

set -e

CERT_DIR="$(dirname "$0")/certs"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=ResolveJa/CN=localhost"

echo "Certificado gerado em $CERT_DIR"
echo "  cert.pem  → certificado público"
echo "  key.pem   → chave privada (nunca commitar!)"
