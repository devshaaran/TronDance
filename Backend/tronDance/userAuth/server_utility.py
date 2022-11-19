import json

import requests

VERIFY = True
API_URL = "http://localhost:3000"


class Utility:
    @staticmethod
    def check_signature_owner(tron_address, signature):

        try:
            data = {
                "address": tron_address,
                "signedmsg": signature
            }
            print(data)
            response = requests.post('{API_URL}/login'.format(API_URL=API_URL),
                                     data=data, verify=VERIFY)
            if response.ok and response.json()["result"]:
                return True

            else:
                return False

        except Exception as e:
            print(e)
            return False

