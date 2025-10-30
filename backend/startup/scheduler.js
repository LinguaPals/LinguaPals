import cron from "node-cron";
import { getWeekTag } from "../utils/dateIds.js";
import { generateAndPublish } from "../services/matchService.js";
import { emit } from "../lib/events.js";

const init = () => {
  cron.schedule("5 0 * * 1", async () => {
    const weekTag = getWeekTag();
    await generateAndPublish(weekTag);
  });
  cron.schedule("0 12 * * *", async () => {
    emit("DAILY_WINDOW_OPEN", {});
  });
};

export default init;
