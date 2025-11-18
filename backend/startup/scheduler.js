import cron from "node-cron";
import { emit } from "../lib/events.js";

const init = () => {
  cron.schedule("0 12 * * *", async () => {
    emit("DAILY_WINDOW_OPEN", {});
  });
};

export default init;

