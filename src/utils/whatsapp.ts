import { whatsapp as wa } from "whatsapp-ts";
import { settings } from "./settings";

const { accessToken, graphVersion, wabaId } = settings();

wa.settings.setup({
  GRAPH_API_VERSION: graphVersion,
  META_APP_ACCESS_TOKEN: accessToken,
  WHATSAPP_ACCOUNT_ID: wabaId,
  META_APP_ID: "null",
  WHATSAPP_NUMBER_ID: "null",
});

export { wa as whatsapp };
