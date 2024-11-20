let express = require('express');
let app = express();

const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry()

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'example-nodejs-app'
})

// Enable the collection of default metrics
client.collectDefaultMetrics({ register })

const counter = new client.Counter({
    name: 'demo_counter_name',
    help: 'demo_counter_help'
  });
counter.inc(); // Inc with 1
counter.inc(10); // Inc with 10
register.registerMetric(counter);

const gauge = new client.Gauge({ name: 'demo_gauge_name', help: 'demo_gauge_help' });
gauge.set(10); // Set to 10
gauge.inc(); // Inc with 1
gauge.inc(10); // Inc with 10
gauge.dec(); // Dec with 1
gauge.dec(10); // Dec with 10
register.registerMetric(gauge);

const histogram = new client.Histogram({
    name: 'demo_histogram_name',
    help: 'demo_histogram_help',
    buckets: [0.1, 5, 15, 50, 100, 500]
  });
register.registerMetric(histogram);
histogram.observe(10);
histogram.observe(100);

const summary = new client.Summary({
    name: 'demo_summary_name',
    help: 'demo_summary_help',
    percentiles: [0.01, 0.1, 0.9, 0.99],
    maxAgeSeconds: 600,
    ageBuckets: 5
});
register.registerMetric(summary);

// Function to simulate random sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
(async () => {
    console.log('Starting the random sleep demonstration with Prometheus Summary...');

    for (let i = 1; i <= 10; i++) {
        const randomSleepTime = Math.floor(Math.random() * 2000); // Random sleep time between 0 and 2000 ms
        console.log(`Iteration ${i}: Sleeping for ${randomSleepTime}ms`);
        // Start the timer
        const end = summary.startTimer();
        // Perform the sleep
        await sleep(randomSleepTime);
        // Stop the timer and record the duration
        end();
        console.log(`Iteration ${i}: Woke up after ${randomSleepTime}ms`);
    }

    console.log('Completed all iterations.');
    // Output the metrics to console for demonstration
    // console.log(await register.metrics());
})();

app.get('/metrics', async function (req, res) {
    // Return all metrics the Prometheus exposition format
    res.set('Content-Type', register.contentType);
    let metrics = await register.metrics();
    res.send(metrics);
})

let server = app.listen(8000, function () {
    let port = server.address().port
    console.log("Application running on port: %s", port)
})
