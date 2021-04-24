import Axios from "axios"
import { map } from "lodash";
import { ZALO_ACCOUNTS, ZALO_API, ZALO_OA_TOKEN } from "../config"


const sendZaloMessage = async (message: string) => {
  const promises: any = [];
  const receivers = ZALO_ACCOUNTS.split(',');
  map(receivers, (receiver) => {
    promises.push(
      Axios.post(`${ZALO_API}/v2.0/oa/message?access_token=${ZALO_OA_TOKEN}`, {
        "recipient": {
          "user_id": receiver
        },
        "message": {
          "text": message
        }
    })
    )
  })

  await Promise.all(promises);
  return true;
}

export default {
  sendZaloMessage
}