import argparse
import json
import logging
import requests
import yaml

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from base64 import b64encode, b64decode
from hashlib import sha256

FORMAT = '%(asctime)s:%(name)s:%(levelname)s - %(message)s'
logging.basicConfig(format=FORMAT, filename='encrypt_post.log', level=logging.INFO)

with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

API_KEY = config['api_key']
ENDPOINT = config['data_endpoint']
KEY = sha256(config['key'].encode("utf-8")).digest()

def encrypt(plain_text: str) -> dict:
    nonce = get_random_bytes(12)
    cipher = AES.new(KEY, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plain_text.encode("utf-8"))

    return {
        "nonce": b64encode(nonce).decode(),
        "ciphertext": b64encode(ciphertext).decode(),
        "tag": b64encode(tag).decode(),
        "api_key": API_KEY
    }

def decrypt(payload: dict) -> str:
    nonce = b64decode(payload["nonce"])
    ciphertext = b64decode(payload["ciphertext"])
    tag = b64decode(payload["tag"])

    cipher = AES.new(KEY, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag).decode("utf-8")

def post(data: dict):
    try:
        res = requests.post(ENDPOINT, json=data, timeout=10)
        logging.info({"status_code": res.status_code, "response": res.text})
        return res
    except Exception:
        logging.exception("POST request failed")
        raise

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("data")
    args = parser.parse_args()

    payload = encrypt(args.data)
    res = post(payload)
    print(res.status_code)

if __name__ == "__main__":
    main()