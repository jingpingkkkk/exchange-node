import express from "express";
import authRoutes from "./routes/authRoutes.js";
import betCategoryRoutes from "./routes/betCategoryRoutes.js";
import betRoutes from "./routes/betRoutes.js";
import casinoGameRoutes from "./routes/casinoGameRoutes.js";
import casinoRoutes from "./routes/casinoRoutes.js";
import competitionRoutes from "./routes/competitionRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import exchangeHomeRoutes from "./routes/exchangeHomeRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import sportRoutes from "./routes/sportRoutes.js";
import sportsBetCategoryRoutes from "./routes/sportsBetCategoryRoutes.js";
import themeSettingRoutes from "./routes/themeSettingRoutes.js";
import themeUserRoutes from "./routes/themeUserRoutes.js";
import transactionActivityRoutes from "./routes/transactionActivityRoutes.js";
import transactionUserRoutes from "./routes/transactionUserRoutes.js";
import transferRequestRoutes from "./routes/transferRequestRoutes.js";
import transferTypeRoutes from "./routes/transferTypeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userstakeRoutes from "./routes/userStakeRoutes.js";
import withdrawGroupRoutes from "./routes/withdrawGroupRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";

const app = express();

app.use("/auth", authRoutes);
app.use("/permission", permissionRoutes);
app.use("/cron", cronRoutes);
app.use("/users", userRoutes);
app.use("/sport", sportRoutes);
app.use("/stake", userstakeRoutes);
app.use("/currencies", currencyRoutes);
app.use("/betCategories", betCategoryRoutes);
app.use("/sportsBetCategories", sportsBetCategoryRoutes);
app.use("/competition", competitionRoutes);
app.use("/event", eventRoutes);
app.use("/exchangeHome", exchangeHomeRoutes);
app.use("/themeSetting", themeSettingRoutes);
app.use("/transactionActivity", transactionActivityRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/themeUser", themeUserRoutes);
app.use("/bet", betRoutes);
app.use("/transactionUser", transactionUserRoutes);
app.use("/withdrawGroup", withdrawGroupRoutes);
app.use("/transferType", transferTypeRoutes);
app.use("/transferRequest", transferRequestRoutes);
app.use("/script", scriptRoutes);
app.use("/casino", casinoRoutes);
app.use("/casinoGame", casinoGameRoutes);
app.use("/market", marketRoutes);
app.use("/promotion", promotionRoutes);
app.use("/oauth", oauthRoutes);

export default app;
