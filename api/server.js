require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const User = require("../models/User");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

mongoose
    .connect(
        "mongodb+srv://matthew27888:123@cluster0.xrw8q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username } = req.body;

    let user = await User.findOne({ username });
    if (!user) {
        user = new User({ username, cookieCount: 0 });
        await user.save();
    }

    res.redirect(`/clicker?username=${username}`);
});

app.get("/clicker", async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.redirect("/");
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.redirect("/");
        }
        const jokeResponse = await axios.get("https://official-joke-api.appspot.com/random_joke");
        const joke = jokeResponse.data;

        res.render("clicker", { username, cookieCount: user.cookieCount, joke });
    } catch (error) {
        console.error("Error fetching joke or user data:", error.message);
        res.render("clicker", {
            username,
            cookieCount: 0,
            joke: { setup: "Oops! Unable to fetch a joke right now.", punchline: "" },
        });
    }
});

app.post("/click", async (req, res) => {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (user) {
        user.cookieCount += 1;
        await user.save();
    }

    res.redirect(`/clicker?username=${username}`);
});

module.exports = app;
