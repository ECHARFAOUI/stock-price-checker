"use strict";
const express = require('express');
const router = express.Router();
const StockModel = require("../models").Stock;
const fetch = require("node-fetch");
const crypto = require("crypto");

function anonymizeIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? [ip] : [],
  });
  return await newStock.save();
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  console.log('Saving stock:', stock, 'Like:', like, 'IP:', ip);
  const foundStock = await findStock(stock);
  console.log('Found stock:', foundStock);
  if (!foundStock) {
    return await createStock(stock, like, ip);
  }
  if (like && !foundStock.likes.includes(ip)) {
    console.log('Adding IP to likes:', ip);
    foundStock.likes.push(ip);
    return await foundStock.save();
  }
  console.log('IP already exists or no like:', ip);
  return foundStock;
}

async function getStock(stock) {
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const data = await response.json();
  if (!data || data === 'Unknown symbol') {
    throw new Error('Invalid stock symbol');
  }
  const { symbol, latestPrice } = data;
  return { symbol, latestPrice };
}

router.get("/stock-prices", async function (req, res) {
  try {
    const { stock, like } = req.query;
    const anonymizedIP = anonymizeIP(req.ip);
    console.log('Request IP:', req.ip, 'Anonymized IP:', anonymizedIP);

    if (!stock) {
      return res.status(400).json({ error: 'Stock symbol required' });
    }

    if (Array.isArray(stock)) {
      const [stock1, stock2] = await Promise.all([
        getStock(stock[0].toUpperCase()),
        getStock(stock[1].toUpperCase()),
      ]);

      if (!stock1.symbol || !stock2.symbol) {
        return res.status(400).json({ error: 'Invalid stock symbol' });
      }

      const [firstStock, secondStock] = await Promise.all([
        saveStock(stock[0].toUpperCase(), like, anonymizedIP),
        saveStock(stock[1].toUpperCase(), like, anonymizedIP),
      ]);

      const stockData = [
        {
          stock: stock1.symbol,
          price: stock1.latestPrice,
          rel_likes: firstStock.likes.length - secondStock.likes.length,
        },
        {
          stock: stock2.symbol,
          price: stock2.latestPrice,
          rel_likes: secondStock.likes.length - firstStock.likes.length,
        },
      ];

      return res.json({ stockData });
    }

    const { symbol, latestPrice } = await getStock(stock.toUpperCase());
    if (!symbol) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const oneStockData = await saveStock(symbol.toUpperCase(), like, anonymizedIP);
    res.json({
      stockData: {
        stock: symbol,
        price: latestPrice,
        likes: oneStockData.likes.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;