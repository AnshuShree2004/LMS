
import app from './app.js'
import connectToDB from './config/db.confiq.js'
const PORT = process.env.PORT || 5003



app.listen(PORT, () => {
    connectToDB()
    console.log(`App is running at http://localhost:${PORT}`)
})