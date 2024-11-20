const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Endpoint to handle alerts
app.post('/', (req, res) => {
    const alertData = req.body;

    if (alertData.alerts && alertData.alerts.length > 0) {
        const alertSummary = alertData.alerts[0].annotations.summary || 'No summary';
        const alertDescription = alertData.alerts[0].annotations.description || 'No description';

        const logMessage = `[${new Date().toISOString()}] Alert received: ${alertSummary} - ${alertDescription}\n`;

        // Log alert to a file
        fs.appendFileSync('alert.log', logMessage);

        // Optional: Trigger a shell script (e.g., alert_script.sh)
        exec(`./alert_script.sh "${alertSummary}"`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing script: ${err.message}`);
                return;
            }
            if (stdout) console.log(`Script output: ${stdout}`);
            if (stderr) console.error(`Script error output: ${stderr}`);
        });

        console.log(`Alert logged: ${alertSummary}`);
        res.status(200).send('Alert received and processed.');
    } else {
        console.error('No alert data received');
        res.status(400).send('Invalid alert data');
    }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
