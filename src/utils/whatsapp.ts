import { whatsapp as wa } from "whatsapp-ts";
import { settings } from "./settings";

const { accessToken, graphVersion, wabaId, wabaNumberId } = settings();

wa.settings.setup({
  GRAPH_API_VERSION: graphVersion,
  META_APP_ACCESS_TOKEN: accessToken,
  WHATSAPP_ACCOUNT_ID: wabaId,
  WHATSAPP_NUMBER_ID: wabaNumberId,
});

export { wa as whatsapp };
