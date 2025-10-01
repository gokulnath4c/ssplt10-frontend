const cors = require("cors");

app.use(cors({
  origin: ["https://ssplt10.cloud", "https://www.ssplt10.cloud"],
  credentials: true
}));
