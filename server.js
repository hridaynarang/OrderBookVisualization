import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import cors from "cors";

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

let orderBookHistory = [];
let totalTicks = 0;

// Maximum samples to keep in memory (downsample large files)
const MAX_SAMPLES = 10000;

// Parse MBP-10 format CSV row into OrderBookSnapshot
function parseMBP10Row(row, tickIndex) {
    const snapshot = {
        timestamp: row.ts_event || tickIndex,
        tickIndex: tickIndex,
        bids: [],
        asks: [],
        midPrice: 0
    };

    // Parse 10 bid/ask levels
    for (let i = 0; i < 10; i++) {
        const bidPriceKey = `bid_px_0${i}`;
        const bidSizeKey = `bid_sz_0${i}`;
        const askPriceKey = `ask_px_0${i}`;
        const askSizeKey = `ask_sz_0${i}`;

        // Prices are already in decimal format (e.g., 61.700000000)
        const bidPrice = parseFloat(row[bidPriceKey]);
        const bidSize = parseInt(row[bidSizeKey], 10) || 0;

        if (bidPrice && bidPrice > 0 && bidSize > 0) {
            snapshot.bids.push({
                price: bidPrice,
                size: bidSize
            });
        }

        const askPrice = parseFloat(row[askPriceKey]);
        const askSize = parseInt(row[askSizeKey], 10) || 0;

        if (askPrice && askPrice > 0 && askSize > 0) {
            snapshot.asks.push({
                price: askPrice,
                size: askSize
            });
        }
    }

    // Calculate mid price if we have both bids and asks
    if (snapshot.bids.length > 0 && snapshot.asks.length > 0) {
        snapshot.midPrice = (snapshot.bids[0].price + snapshot.asks[0].price) / 2;
    }

    return snapshot;
}

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    console.log("Starting file processing...");

    // Pass 1: Count total rows
    let rowCount = 0;
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", () => {
            rowCount++;
            if (rowCount % 100000 === 0) {
                console.log(`Counting... ${rowCount} rows`);
            }
        })
        .on("end", () => {
            console.log(`Total rows: ${rowCount}`);
            const stride = Math.max(1, Math.ceil(rowCount / MAX_SAMPLES));
            console.log(`Using stride of ${stride} to get ~${MAX_SAMPLES} samples`);

            // Pass 2: Sample with fixed stride
            const samples = [];
            let rowIndex = 0;

            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on("data", (row) => {
                    if (rowIndex % stride === 0) {
                        samples.push(parseMBP10Row(row, rowIndex));
                    }
                    rowIndex++;
                    if (rowIndex % 100000 === 0) {
                        console.log(`Processing... ${rowIndex}/${rowCount} rows, ${samples.length} samples`);
                    }
                })
                .on("end", () => {
                    orderBookHistory = samples;
                    totalTicks = rowCount;

                    console.log(`Done! Stored ${samples.length} samples from ${totalTicks} total ticks`);

                    fs.unlink(req.file.path, () => {});

                    res.json({
                        success: true,
                        count: totalTicks,
                        samples: samples.length,
                        stride: stride
                    });
                })
                .on("error", (err) => {
                    console.error("Error processing file:", err);
                    res.status(500).json({ success: false, error: err.message });
                });
        })
        .on("error", (err) => {
            console.error("Error counting rows:", err);
            res.status(500).json({ success: false, error: err.message });
        });
});

// Get orderbook data
app.get("/orderbook", (_req, res) => {
    const stride = totalTicks > 0 ? Math.ceil(totalTicks / orderBookHistory.length) : 1;

    res.json({
        snapshots: orderBookHistory,
        totalTicks: totalTicks,
        stride: stride
    });
});

app.listen(4000, () => console.log("Server running on port 4000"));
