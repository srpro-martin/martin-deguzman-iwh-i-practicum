const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/pets"; // Replace with your custom object name
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

console.log('HUBSPOT_ACCESS_TOKEN:', HUBSPOT_ACCESS_TOKEN);

// Route for homepage ("/") - Display all CRM records
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${HUBSPOT_API_URL}?properties=name,species,age`, {
            headers: {
                Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const records = response.data.results || [];

        res.render('homepage', { title: 'Custom Object Records', records });
    } catch (error) {
        console.error("Error fetching records:", error.response ? error.response.data : error.message);
        res.status(500).send("Error retrieving records");
    }
});

// Route for "/update-cobj" - Display form to create new record
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form' });
});

// Route for "/update-cobj" - Handle form submission and create a new record
app.post('/update-cobj', async (req, res) => {
    const { name, species, age } = req.body;

    if (!name || !species || !age) {
        return res.status(400).send("All fields are required");
    }

    try {
        const response = await axios.post(HUBSPOT_API_URL, {
            properties: {
                name,
                species,
                age
            }
        }, {
            headers: {
                Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("New record created:", response.data);
        res.redirect('/');
    } catch (error) {
        console.error("Error creating record:", error.response ? error.response.data : error.message);
        res.status(500).send("Error creating record");
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
